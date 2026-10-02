import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { safeNext } from '$lib/href';
import { m } from '$lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
	return {
		metaTitle: m.meta_login_title(),
		metaDescription: m.meta_login_description()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = form.get('email')?.toString().trim().toLowerCase() ?? '';
		const password = form.get('password')?.toString() ?? '';
		const next = safeNext(form.get('next')?.toString() ?? null);

		if (!email || !password) return fail(400, { error: 'missing' });

		try {
			await auth.api.signInEmail({
				body: { email, password },
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) return fail(400, { error: 'invalid' });
			return fail(500, { error: 'generic' });
		}

		const destination = next.includes('?') ? `${next}&notice=welcome` : `${next}?notice=welcome`;
		redirect(303, destination);
	}
};
