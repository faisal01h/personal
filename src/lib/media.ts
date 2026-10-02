export const IMAGE_TYPES: Record<string, string> = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/gif': '.gif',
	'image/webp': '.webp',
	'image/avif': '.avif'
};

export const VIDEO_TYPES: Record<string, string> = {
	'video/mp4': '.mp4',
	'video/webm': '.webm',
	'video/quicktime': '.mov'
};

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

export function mediaKind(type: string) {
	if (type in IMAGE_TYPES) return 'image' as const;
	if (type in VIDEO_TYPES) return 'video' as const;
	return null;
}

export function mediaExtension(type: string) {
	return IMAGE_TYPES[type] ?? VIDEO_TYPES[type] ?? null;
}
