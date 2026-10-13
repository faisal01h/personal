import { error, fail, redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/guard';
import { deleteProject, getProject, readProjectInput, saveProject } from '$lib/server/projects';
import { localizeHref } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	if (event.params.id === 'new') {
		return { project: null, metaTitle: m.meta_new_project() };
	}
	const project = await getProject(event.params.id);
	if (!project) error(404);
	return { project, metaTitle: m.meta_edit_project({ title: project.title }) };
};

export const actions: Actions = {
	save: async (event) => {
		requireUser(event);
		const form = await event.request.formData();
		const current = event.params.id === 'new' ? null : await getProject(event.params.id);
		if (event.params.id !== 'new' && !current) error(404);
		const parsed = readProjectInput(form, current?.status ?? 'draft');
		if ('error' in parsed && parsed.error) return fail(400, { error: parsed.error });
		if (!('input' in parsed) || !parsed.input) return fail(400, { error: 'repo' });
		const id = await saveProject(parsed.input, current?.id);
		if (!id) error(404);
		const intent = form.get('intent')?.toString();
		const notice =
			intent === 'publish'
				? 'project-published'
				: intent === 'unpublish'
					? 'project-hidden'
					: 'project-saved';
		redirect(303, `${localizeHref(`/studio/projects/${id}`)}?notice=${notice}`);
	},
	remove: async (event) => {
		requireUser(event);
		if (event.params.id === 'new') redirect(303, localizeHref('/studio/projects'));
		await deleteProject(event.params.id);
		redirect(303, `${localizeHref('/studio/projects')}?notice=project-deleted`);
	}
};
