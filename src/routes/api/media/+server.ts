import { error, json } from '@sveltejs/kit';
import { saveUpload } from '$lib/server/uploads';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Sign in required');
	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File)) error(400, 'Missing file');
	const saved = await saveUpload(file);
	return json(saved);
};
