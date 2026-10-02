import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, mediaKind } from '$lib/media';

export async function uploadMedia(file: File) {
	const kind = mediaKind(file.type);
	if (!kind) throw new Error('type');
	if (file.size > (kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES)) throw new Error('size');

	const body = new FormData();
	body.set('file', file);
	const response = await fetch('/api/media', { method: 'POST', body });
	if (!response.ok) {
		if (response.status === 413) throw new Error('size');
		if (response.status === 400) throw new Error('type');
		throw new Error('upload');
	}
	const payload = (await response.json()) as { url?: string };
	if (!payload.url) throw new Error('upload');
	return payload.url;
}
