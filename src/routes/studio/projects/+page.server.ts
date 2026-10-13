import { fail, redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/guard';
import { deleteProject, listProjects, projectStats } from '$lib/server/projects';
import { localizeHref } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const [projects, stats] = await Promise.all([listProjects(), projectStats()]);
	return {
		projects,
		stats,
		metaTitle: m.meta_projects(),
		metaDescription: m.studio_projects_lede()
	};
};

export const actions: Actions = {
	remove: async (event) => {
		requireUser(event);
		const form = await event.request.formData();
		const id = form.get('id')?.toString() ?? '';
		if (!id) return fail(400, { error: 'generic' });
		await deleteProject(id);
		redirect(303, `${localizeHref('/studio/projects')}?notice=project-deleted`);
	}
};
