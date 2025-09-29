import { fail, redirect } from '@sveltejs/kit';
import { setupPassword, hasSetupPassword, setAuthCookie } from '$lib/server/auth';
import { superValidate } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';
import { setupSchema, validateSetupForm } from '$lib/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (await hasSetupPassword()) {
		throw redirect(302, '/');
	}

	const form = await superValidate(arktype(setupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		if (await hasSetupPassword()) {
			throw redirect(302, '/');
		}

		const form = await superValidate(request, arktype(setupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const validation = validateSetupForm(form.data);
		if ('problems' in validation) {
			return fail(400, { form });
		}

		try {
			const token = await setupPassword(form.data.password);
			setAuthCookie(cookies, token);
			throw redirect(302, '/');
		} catch (error) {
			return fail(500, {
				form,
				error: 'Failed to setup password'
			});
		}
	}
};
