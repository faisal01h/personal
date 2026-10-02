<script lang="ts">
	import 'prosekit/basic/style.css';
	import 'prosekit/basic/typography.css';
	import { defineBasicExtension } from 'prosekit/basic';
	import { createEditor, union } from 'prosekit/core';
	import { definePlaceholder } from 'prosekit/extensions/placeholder';
	import { ProseKit } from 'prosekit/svelte';
	import { untrack } from 'svelte';
	import { countWords, plainText } from '$lib/text';
	import { m } from '$lib/paraglide/messages.js';
	import { definePostMedia } from '$lib/editor/video';
	import DocSync from './DocSync.svelte';
	import EditorToolbar from './EditorToolbar.svelte';

	let {
		json = $bindable(''),
		html = $bindable(''),
		words = $bindable(countWords(plainText(html))),
		placeholder
	}: {
		json?: string;
		html?: string;
		words?: number;
		placeholder: string;
	} = $props();

	function initialContent() {
		if (!json) return undefined;
		try {
			const parsed = JSON.parse(json);
			if (parsed?.type === 'doc') return parsed;
		} catch {
			return undefined;
		}
		return undefined;
	}

	const placeholderText = untrack(() => placeholder);
	const extension = union(
		defineBasicExtension(),
		definePostMedia(),
		definePlaceholder({ placeholder: placeholderText, strategy: 'doc' })
	);
	const editor = createEditor({ extension, defaultContent: initialContent() });

	function sync(nextJson: string, nextHtml: string) {
		json = nextJson;
		html = nextHtml;
		words = countWords(plainText(nextHtml));
	}
</script>

<div class="editor-surface overflow-hidden rounded-[1.2rem] border border-line bg-raised">
	<ProseKit {editor}>
		<EditorToolbar />
		<div {@attach editor.mount}></div>
		<DocSync onchange={sync} />
	</ProseKit>
	<p class="border-t border-line px-4 py-2 text-xs text-muted">
		{m.editor_words({ count: words })}
	</p>
</div>
