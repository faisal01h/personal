import { m } from '$lib/paraglide/messages.js';
import { listPublished } from '$lib/server/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts = await listPublished(3);
	return {
		posts,
		metaTitle: m.meta_home_title(),
		metaDescription: m.meta_default_description()
	};
};
