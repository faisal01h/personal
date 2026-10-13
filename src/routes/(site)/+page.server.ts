import { m } from '$lib/paraglide/messages.js';
import { listPublishedProjects } from '$lib/server/projects';
import { listPublished } from '$lib/server/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [posts, projects] = await Promise.all([listPublished(3), listPublishedProjects()]);
	return {
		posts,
		projects,
		metaTitle: m.meta_home_title(),
		metaDescription: m.meta_default_description()
	};
};
