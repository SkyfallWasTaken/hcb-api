import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword, hasSetupPassword, setAuthCookie } from '$lib/server/auth';
import { superValidate } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!(await hasSetupPassword())) {
		throw redirect(302, '/setup');
	}

	// Initialize the form
	const form = await superValidate(arktype(loginSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, arktype(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const token = await verifyPassword(form.data.password);

		if (!token) {
			// Set a custom error for invalid password
			form.errors.password = ['Invalid password'];
			return fail(400, { form });
		}

		setAuthCookie(cookies, token);
		throw redirect(302, '/');
	}
};
