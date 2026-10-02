import { error, fail, redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/guard';
import { deletePost, getPost, readPostInput, savePost } from '$lib/server/posts';
import { localizeHref } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	if (event.params.id === 'new') {
		return { post: null, metaTitle: m.meta_new_post() };
	}
	const post = await getPost(event.params.id);
	if (!post) error(404);
	return { post, metaTitle: m.meta_edit_post({ title: post.title }) };
};

export const actions: Actions = {
	save: async (event) => {
		requireUser(event);
		const form = await event.request.formData();
		const current = event.params.id === 'new' ? null : await getPost(event.params.id);
		if (event.params.id !== 'new' && !current) error(404);
		const parsed = readPostInput(form, current?.status ?? 'draft', current?.locale ?? 'en');
		if ('error' in parsed && parsed.error) return fail(400, { error: parsed.error });
		if (!('input' in parsed) || !parsed.input) return fail(400, { error: 'content' });
		const saved = await savePost(parsed.input, current?.id);
		if (!saved) error(404);
		const intent = form.get('intent')?.toString();
		const notice =
			intent === 'publish' ? 'published' : intent === 'unpublish' ? 'unpublished' : 'saved';
		redirect(303, `${localizeHref(`/studio/posts/${saved.id}`)}?notice=${notice}`);
	},
	remove: async (event) => {
		requireUser(event);
		if (event.params.id === 'new') redirect(303, localizeHref('/studio'));
		await deletePost(event.params.id);
		redirect(303, `${localizeHref('/studio')}?notice=deleted`);
	}
};
