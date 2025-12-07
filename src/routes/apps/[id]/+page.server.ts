import { db, app } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';
import { appPermissionsSchema, deleteAppSchema, regenerateApiKeySchema } from '$lib/home';
import { genApiKey } from '$lib/utils';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const { params, parent } = event;

	if (!params.id.startsWith('app_')) throw error(404, 'App not found');

	const { apps } = await parent();
	const selectedApp = apps.find((app: any) => app.id === params.id);

	if (!selectedApp) {
		throw error(404, 'App not found');
	}

	const form = await superValidate(
		{
			allowMoneyMovement: selectedApp.allowMoneyMovement,
			allowCardAccess: selectedApp.allowCardAccess,
			allowFundraising: selectedApp.allowFundraising,
			allowBookkeeping: selectedApp.allowBookkeeping,
			allowOrgAdmin: selectedApp.allowOrgAdmin,
			allowViewFinancials: selectedApp.allowViewFinancials
		},
		arktype(appPermissionsSchema)
	);

	// @ts-expect-error
	const deleteForm = await superValidate({ confirm: '' }, arktype(deleteAppSchema));
	// @ts-expect-error
	const regenerateForm = await superValidate({ confirm: '' }, arktype(regenerateApiKeySchema));

	return {
		app: {
			id: selectedApp.id,
			name: selectedApp.name,
			allowMoneyMovement: selectedApp.allowMoneyMovement,
			allowCardAccess: selectedApp.allowCardAccess,
			allowFundraising: selectedApp.allowFundraising,
			allowBookkeeping: selectedApp.allowBookkeeping,
			allowOrgAdmin: selectedApp.allowOrgAdmin,
			allowViewFinancials: selectedApp.allowViewFinancials
		},
		form,
		deleteForm,
		regenerateForm
	};
};

export const actions: Actions = {
	updatePermissions: async ({ request, params, cookies }) => {
		if (!params.id.startsWith('app_')) throw error(404, 'App not found');

		const form = await superValidate(request, arktype(appPermissionsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await db
			.update(app)
			.set({
				allowMoneyMovement: form.data.allowMoneyMovement,
				allowCardAccess: form.data.allowCardAccess,
				allowFundraising: form.data.allowFundraising,
				allowBookkeeping: form.data.allowBookkeeping,
				allowOrgAdmin: form.data.allowOrgAdmin,
				allowViewFinancials: form.data.allowViewFinancials
			})
			.where(eq(app.id, params.id));

		redirect(
			`/apps/${params.id}`,
			{
				type: 'success',
				message: 'Permissions updated successfully!'
			},
			cookies
		);
	},

	delete: async ({ request, params, cookies }) => {
		if (!params.id.startsWith('app_')) throw error(404, 'App not found');

		const deleteForm = await superValidate(request, arktype(deleteAppSchema));

		if (!deleteForm.valid) {
			return fail(400, { deleteForm });
		}

		await db.delete(app).where(eq(app.id, params.id));

		redirect(
			'/',
			{
				type: 'success',
				message: 'Application deleted successfully!'
			},
			cookies
		);
	},

	regenerateApiKey: async ({ request, params, cookies }) => {
		if (!params.id.startsWith('app_')) throw error(404, 'App not found');

		const regenerateForm = await superValidate(request, arktype(regenerateApiKeySchema));

		if (!regenerateForm.valid) {
			return fail(400, { regenerateForm });
		}

		const key = await genApiKey();
		await db.update(app).set({ apiKeyHash: key.hash }).where(eq(app.id, params.id));

		throw redirect(
			303,
			`/apps/${params.id}`,
			{
				type: 'success',
				message: 'API key regenerated successfully!',
				data: { apiKey: key.key }
			},
			cookies
		);
	}
};
