import { m } from '$lib/paraglide/messages.js';
import { listPublished } from '$lib/server/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		posts: await listPublished(),
		metaTitle: m.meta_blog_title(),
		metaDescription: m.meta_blog_description()
	};
};
