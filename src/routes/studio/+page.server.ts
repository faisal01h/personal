import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { requireUser } from '$lib/server/guard';
import { projectStats } from '$lib/server/projects';
import { deletePost, listManaged, postStats } from '$lib/server/posts';
import { localizeHref } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const status = event.url.searchParams.get('status') ?? 'all';
	const locale = event.url.searchParams.get('locale') ?? 'all';
	const q = event.url.searchParams.get('q') ?? '';
	const [posts, stats, projects] = await Promise.all([
		listManaged({ q, status, locale }),
		postStats(),
		projectStats()
	]);
	return {
		posts,
		stats,
		projects,
		filters: { q, status, locale },
		metaTitle: m.meta_studio_title(),
		metaDescription: m.meta_studio_description()
	};
};

export const actions: Actions = {
	remove: async (event) => {
		requireUser(event);
		const form = await event.request.formData();
		const id = form.get('id')?.toString() ?? '';
		if (!id) return fail(400, { error: 'generic' });
		await deletePost(id);
		redirect(303, `${localizeHref('/studio')}?notice=deleted`);
	},
	signOut: async (event) => {
		await auth.api.signOut({ headers: event.request.headers });
		redirect(303, `${localizeHref('/')}?notice=signed-out`);
	}
};
