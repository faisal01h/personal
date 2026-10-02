import { defineCommands, defineNodeSpec, insertNode, union } from '@prosekit/core';
import type { EditorView } from '@prosekit/pm/view';
import { defineFileDropHandler, defineFilePasteHandler } from 'prosekit/extensions/file';
import { defineImageUploadHandler } from 'prosekit/extensions/image';
import { uploadMedia } from '$lib/upload-media';

const uploader = async ({ file }: { file: File }) => uploadMedia(file);

function insertVideoFile(view: EditorView, file: File, pos?: number) {
	void uploadMedia(file)
		.then((src) => {
			insertNode({ type: 'video', attrs: { src }, pos })(view.state, view.dispatch, view);
		})
		.catch(() => undefined);
	return true;
}

export function definePostMedia() {
	return union(
		defineNodeSpec({
			name: 'video',
			atom: true,
			defining: true,
			draggable: true,
			group: 'block',
			attrs: { src: { default: null } },
			parseDOM: [
				{
					tag: 'video[src]',
					getAttrs: (element) => {
						if (typeof element === 'string') return false;
						const src = element.getAttribute('src');
						return src ? { src } : false;
					}
				}
			],
			toDOM(node) {
				return [
					'video',
					{
						src: node.attrs.src,
						controls: 'true',
						preload: 'metadata',
						playsinline: 'true'
					}
				];
			}
		}),
		defineCommands({
			insertVideo: (attrs: { src: string }) => insertNode({ type: 'video', attrs })
		}),
		defineImageUploadHandler({ uploader }),
		defineFilePasteHandler((options) => {
			if (!options.file.type.startsWith('video/')) return false;
			return insertVideoFile(options.view, options.file);
		}),
		defineFileDropHandler((options) => {
			if (!options.file.type.startsWith('video/')) return false;
			return insertVideoFile(options.view, options.file, options.pos);
		})
	);
}
