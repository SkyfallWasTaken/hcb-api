import { superValidate, message } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { newAppSchema } from "$lib/home"
import { db, app } from '$lib/server/db';
import { genApiKey } from '$lib/utils';

export const load = async () => {
  const form = await superValidate(arktype(newAppSchema));
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, arktype(newAppSchema));
    console.log(form);

    if (!form.valid) {
      return fail(400, { form });
    }

    const key = await genApiKey();
    const [newApp] = await db.insert(app).values({ appName: form.data.name, apiKeyHash: key.hash }).returning();

    throw redirect(303, `/apps/${newApp.id}`);
  }
};