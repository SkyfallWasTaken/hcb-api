import { fail, redirect } from '@sveltejs/kit';
import { exchangeCodeForTokens, storeTokenResponse } from '$lib/server/oauth';
import { env } from '$env/dynamic/private';

export const load = async () => {
  if (!env.HCB_CLIENT_ID) {
    throw new Error('HCB_CLIENT_ID environment variable is not set');
  }

  return {
    clientId: env.HCB_CLIENT_ID
  };
};

export const actions = {
  setup: async ({ request }) => {
    const data = await request.formData();
    const code = data.get('code') as string;

    if (!code) {
      return fail(400, {
        error: 'Authorization code is required'
      });
    }

    if (!env.HCB_CLIENT_ID) {
      return fail(500, {
        error: 'HCB_CLIENT_ID environment variable is not configured'
      });
    }

    let success = false;
    try {
      const tokenResponse = await exchangeCodeForTokens(code, env.HCB_CLIENT_ID);
      await storeTokenResponse(tokenResponse, env.HCB_CLIENT_ID);
      success = true;
    } catch (error) {
      if (error instanceof Response && error.status === 303) {
        throw error;
      }
      console.error('OAuth setup error:', error);
      return fail(500, {
        error: 'Failed to exchange code for tokens. Please check your authorization code.'
      });
    }
    if (success) throw redirect(303, '/');
  }
};