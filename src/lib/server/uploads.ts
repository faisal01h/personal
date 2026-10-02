import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { error } from '@sveltejs/kit';
import { mediaExtension, mediaKind, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '$lib/media';

const NAME =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|gif|webp|avif|mp4|webm|mov)$/i;

const MIME: Record<string, string> = {
	jpg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp',
	avif: 'image/avif',
	mp4: 'video/mp4',
	webm: 'video/webm',
	mov: 'video/quicktime'
};

export function uploadsDir() {
	return path.join(process.cwd(), 'uploads');
}

export async function saveUpload(file: File) {
	const kind = mediaKind(file.type);
	const extension = mediaExtension(file.type);
	if (!kind || !extension) error(400, 'Unsupported file');
	const limit = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
	if (file.size <= 0 || file.size > limit) error(413, 'File is too large');

	const name = `${crypto.randomUUID()}${extension}`;
	const dir = uploadsDir();
	await mkdir(dir, { recursive: true });
	await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
	return { url: `/media/${name}`, kind };
}

export async function readUpload(name: string, rangeHeader: string | null) {
	if (!NAME.test(name)) error(404);
	const filePath = path.join(uploadsDir(), name);
	let info;
	try {
		info = await stat(filePath);
	} catch {
		error(404);
	}
	if (!info.isFile()) error(404);

	const extension = name.split('.').pop()?.toLowerCase() ?? '';
	const type = MIME[extension] ?? 'application/octet-stream';
	const size = info.size;
	const shared = {
		'Accept-Ranges': 'bytes',
		'Cache-Control': 'public, max-age=31536000, immutable',
		'Content-Type': type
	};

	const match = rangeHeader ? /^bytes=(\d*)-(\d*)$/.exec(rangeHeader) : null;
	if (!match) {
		return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream, {
			headers: { ...shared, 'Content-Length': String(size) }
		});
	}

	const start = match[1] ? Number(match[1]) : 0;
	const end = match[2] ? Number(match[2]) : size - 1;
	if (start > end || start >= size || end >= size) {
		return new Response(null, {
			status: 416,
			headers: { ...shared, 'Content-Range': `bytes */${size}` }
		});
	}

	return new Response(
		Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream,
		{
			status: 206,
			headers: {
				...shared,
				'Content-Length': String(end - start + 1),
				'Content-Range': `bytes ${start}-${end}/${size}`
			}
		}
	);
}
