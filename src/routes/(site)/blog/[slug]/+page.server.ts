import { error } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages.js';
import { getPublishedBySlug } from '$lib/server/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPublishedBySlug(params.slug);
	if (!post) error(404);
	return {
		post,
		metaTitle: `${post.title} — Faisal Hanif`,
		metaDescription: post.excerpt || m.meta_blog_description()
	};
};
