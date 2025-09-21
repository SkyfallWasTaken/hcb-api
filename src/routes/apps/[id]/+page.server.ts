import { db, app } from "$lib/server/db"
import { eq } from "drizzle-orm"
import { error, fail } from "@sveltejs/kit"
import { redirect } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';
import { appPermissionsSchema, deleteAppSchema } from "$lib/home"
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
  const { params, parent } = event;

  if (!params.id.startsWith("app_")) throw error(404, 'App not found');

  const { apps } = await parent();
  const selectedApp = apps.find((app: any) => app.id === params.id);

  if (!selectedApp) {
    throw error(404, 'App not found')
  }

  const form = await superValidate({
    allowMoneyMovement: selectedApp.allowMoneyMovement,
    allowCardAccess: selectedApp.allowCardAccess
  }, arktype(appPermissionsSchema));

  const deleteForm = await superValidate({ confirm: '' }, arktype(deleteAppSchema));

  return {
    app: {
      id: selectedApp.id,
      name: selectedApp.name,
      allowMoneyMovement: selectedApp.allowMoneyMovement,
      allowCardAccess: selectedApp.allowCardAccess
    },
    form,
    deleteForm,
  }
}

export const actions: Actions = {
  updatePermissions: async ({ request, params, cookies }) => {
    if (!params.id.startsWith("app_")) throw error(404, 'App not found');

    const form = await superValidate(request, arktype(appPermissionsSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    await db.update(app)
      .set({
        allowMoneyMovement: form.data.allowMoneyMovement,
        allowCardAccess: form.data.allowCardAccess
      })
      .where(eq(app.id, params.id));

    redirect(`/apps/${params.id}`, {
      type: 'success',
      message: 'Permissions updated successfully!'
    }, cookies);
  },

  delete: async ({ request, params, cookies }) => {
    if (!params.id.startsWith("app_")) throw error(404, 'App not found');

    const deleteForm = await superValidate(request, arktype(deleteAppSchema));

    if (!deleteForm.valid) {
      return fail(400, { deleteForm });
    }

    await db.delete(app).where(eq(app.id, params.id));

    redirect('/', {
      type: 'success',
      message: 'Application deleted successfully!'
    }, cookies);
  }
}