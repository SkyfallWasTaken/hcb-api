import { superValidate } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { newAppSchema } from "$lib/home"
import { db, app } from '$lib/server/db';
import { genApiKey } from '$lib/utils';

export const load = async () => {
  const form = await superValidate(arktype(newAppSchema));
  return { form };
};

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, arktype(newAppSchema));
    console.log(form);

    if (!form.valid) {
      return fail(400, { form });
    }

    const key = await genApiKey();
    const [newApp] = await db.insert(app).values({ appName: form.data.name, apiKeyHash: key.hash }).returning();

    redirect(`/apps/${newApp.id}`, {
      type: 'success',
      message: 'App created successfully!',
      data: { apiKey: key.key }
    }, cookies);
  }
};