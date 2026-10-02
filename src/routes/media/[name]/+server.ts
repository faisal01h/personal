import { readUpload } from '$lib/server/uploads';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	return readUpload(params.name, request.headers.get('range'));
};
