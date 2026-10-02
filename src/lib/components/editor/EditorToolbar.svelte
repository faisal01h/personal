<script lang="ts">
	import { defineBasicExtension } from 'prosekit/basic';
	import { useEditor } from 'prosekit/svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { uploadMedia } from '$lib/upload-media';
	import { toast } from '$lib/toast.svelte';
	import Bold from '@lucide/svelte/icons/bold';
	import Italic from '@lucide/svelte/icons/italic';
	import Underline from '@lucide/svelte/icons/underline';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import Code from '@lucide/svelte/icons/code';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Quote from '@lucide/svelte/icons/quote';
	import SquareCode from '@lucide/svelte/icons/square-code';
	import Minus from '@lucide/svelte/icons/minus';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Clapperboard from '@lucide/svelte/icons/clapperboard';
	import Table from '@lucide/svelte/icons/table';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import Redo2 from '@lucide/svelte/icons/redo-2';
	import type { Component } from 'svelte';

	const editor = useEditor<ReturnType<typeof defineBasicExtension>>({ update: true });
	let linkOpen = $state(false);
	let linkUrl = $state('https://');
	let uploading = $state(false);
	let imageInput = $state<HTMLInputElement | null>(null);
	let videoInput = $state<HTMLInputElement | null>(null);

	function pressed(active: boolean) {
		return active ? 'true' : 'false';
	}

	function normalizeLink(value: string) {
		const trimmed = value.trim();
		if (!trimmed) return null;
		if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\'))
			return trimmed;
		try {
			const url = new URL(trimmed);
			if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
				return url.href;
			}
		} catch {
			return null;
		}
		return null;
	}

	function applyLink() {
		const href = normalizeLink(linkUrl);
		if (!href) {
			toast.error(m.toast_link_invalid());
			return;
		}
		const external = href.startsWith('http');
		$editor.commands.addLink(
			external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href }
		);
		$editor.focus();
		linkOpen = false;
	}

	function uploadError(error: unknown) {
		const code = error instanceof Error ? error.message : '';
		if (code === 'type') toast.error(m.toast_upload_type());
		else if (code === 'size') toast.error(m.toast_upload_large());
		else toast.error(m.toast_upload_failed());
	}

	async function onImageFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		$editor.commands.uploadImage({
			file,
			uploader: async ({ file: image }) => uploadMedia(image),
			onError: ({ error }) => uploadError(error)
		});
		$editor.focus();
	}

	async function onVideoFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		uploading = true;
		try {
			const src = await uploadMedia(file);
			const commands = $editor.commands as typeof $editor.commands & {
				insertVideo: (attrs: { src: string }) => void;
			};
			commands.insertVideo({ src });
			$editor.focus();
		} catch (error) {
			uploadError(error);
		} finally {
			uploading = false;
		}
	}

	function onFieldKey(event: KeyboardEvent, apply: () => void) {
		if (event.key === 'Enter') {
			event.preventDefault();
			apply();
		}
		if (event.key === 'Escape') linkOpen = false;
	}

	const block = $derived.by(() => {
		if ($editor.nodes.heading.isActive({ level: 2 })) return '2';
		if ($editor.nodes.heading.isActive({ level: 3 })) return '3';
		if ($editor.nodes.heading.isActive({ level: 4 })) return '4';
		return 'p';
	});

	const marks: {
		id: string;
		label: () => string;
		icon: Component;
		active: () => boolean;
		run: () => void;
	}[] = [
		{
			id: 'bold',
			label: () => m.tool_bold(),
			icon: Bold,
			active: () => $editor.marks.bold.isActive(),
			run: () => $editor.commands.toggleBold()
		},
		{
			id: 'italic',
			label: () => m.tool_italic(),
			icon: Italic,
			active: () => $editor.marks.italic.isActive(),
			run: () => $editor.commands.toggleItalic()
		},
		{
			id: 'underline',
			label: () => m.tool_underline(),
			icon: Underline,
			active: () => $editor.marks.underline.isActive(),
			run: () => $editor.commands.toggleUnderline()
		},
		{
			id: 'strike',
			label: () => m.tool_strike(),
			icon: Strikethrough,
			active: () => $editor.marks.strike.isActive(),
			run: () => $editor.commands.toggleStrike()
		},
		{
			id: 'code',
			label: () => m.tool_code(),
			icon: Code,
			active: () => $editor.marks.code.isActive(),
			run: () => $editor.commands.toggleCode()
		}
	];
</script>

<div class="border-b border-line bg-raised/80">
	<div
		class="flex flex-wrap items-center gap-1 px-2 py-2"
		role="toolbar"
		aria-label={m.editor_toolbar()}
	>
		<label class="sr-only" for="block-style">{m.tool_paragraph()}</label>
		<select
			id="block-style"
			class="field h-9 w-auto rounded-lg py-1 pr-8 text-sm"
			value={block}
			onchange={(event) => {
				const value = event.currentTarget.value;
				if (value === 'p') $editor.commands.setParagraph();
				else $editor.commands.setHeading({ level: Number(value) });
				$editor.focus();
			}}
		>
			<option value="p">{m.tool_paragraph()}</option>
			{#each [2, 3, 4] as level (level)}
				<option value={String(level)}>{m.tool_heading({ level })}</option>
			{/each}
		</select>

		<span class="mx-1 hidden h-5 w-px bg-line sm:block"></span>

		{#each marks as item (item.id)}
			<button
				type="button"
				class="tool-btn"
				aria-label={item.label()}
				title={item.label()}
				aria-pressed={pressed(item.active())}
				onclick={() => item.run()}
			>
				<item.icon size={16} />
			</button>
		{/each}

		<span class="mx-1 hidden h-5 w-px bg-line sm:block"></span>

		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_bullet()}
			title={m.tool_bullet()}
			aria-pressed={pressed($editor.nodes.list.isActive({ kind: 'bullet' }))}
			onclick={() => $editor.commands.toggleList({ kind: 'bullet' })}
		>
			<List size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_ordered()}
			title={m.tool_ordered()}
			aria-pressed={pressed($editor.nodes.list.isActive({ kind: 'ordered' }))}
			onclick={() => $editor.commands.toggleList({ kind: 'ordered' })}
		>
			<ListOrdered size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_task()}
			title={m.tool_task()}
			aria-pressed={pressed($editor.nodes.list.isActive({ kind: 'task' }))}
			onclick={() => $editor.commands.toggleList({ kind: 'task' })}
		>
			<ListChecks size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_quote()}
			title={m.tool_quote()}
			aria-pressed={pressed($editor.nodes.blockquote.isActive())}
			onclick={() => $editor.commands.toggleBlockquote()}
		>
			<Quote size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_code_block()}
			title={m.tool_code_block()}
			aria-pressed={pressed($editor.nodes.codeBlock.isActive())}
			onclick={() => $editor.commands.toggleCodeBlock()}
		>
			<SquareCode size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_rule()}
			title={m.tool_rule()}
			onclick={() => $editor.commands.insertHorizontalRule()}
		>
			<Minus size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={$editor.marks.link.isActive() ? m.tool_unlink() : m.tool_link()}
			title={$editor.marks.link.isActive() ? m.tool_unlink() : m.tool_link()}
			aria-pressed={pressed($editor.marks.link.isActive() || linkOpen)}
			onclick={() => {
				if ($editor.marks.link.isActive()) {
					$editor.commands.removeLink();
					linkOpen = false;
					return;
				}
				linkOpen = !linkOpen;
			}}
		>
			<LinkIcon size={16} />
		</button>
		<input
			bind:this={imageInput}
			class="sr-only"
			type="file"
			accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
			onchange={onImageFile}
		/>
		<input
			bind:this={videoInput}
			class="sr-only"
			type="file"
			accept="video/mp4,video/webm,video/quicktime"
			onchange={onVideoFile}
		/>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_image()}
			title={m.tool_image()}
			disabled={uploading}
			onclick={() => imageInput?.click()}
		>
			<ImageIcon size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_video()}
			title={m.tool_video()}
			disabled={uploading}
			onclick={() => videoInput?.click()}
		>
			<Clapperboard size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_table()}
			title={m.tool_table()}
			onclick={() => $editor.commands.insertTable({ row: 3, col: 3, header: true })}
		>
			<Table size={16} />
		</button>

		<span class="mx-1 hidden h-5 w-px bg-line sm:block"></span>

		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_undo()}
			title={m.tool_undo()}
			onclick={() => $editor.commands.undo()}
		>
			<Undo2 size={16} />
		</button>
		<button
			type="button"
			class="tool-btn"
			aria-label={m.tool_redo()}
			title={m.tool_redo()}
			onclick={() => $editor.commands.redo()}
		>
			<Redo2 size={16} />
		</button>
	</div>

	{#if linkOpen}
		<div class="flex flex-col gap-2 border-t border-line px-3 py-3 sm:flex-row">
			<input
				class="field"
				type="url"
				value={linkUrl}
				placeholder={m.tool_link_placeholder()}
				oninput={(event) => (linkUrl = event.currentTarget.value)}
				onkeydown={(event) => onFieldKey(event, applyLink)}
			/>
			<div class="flex gap-2">
				<button type="button" class="btn btn-primary px-3 py-2" onclick={applyLink}>
					{m.tool_apply()}
				</button>
				<button type="button" class="btn btn-ghost px-3 py-2" onclick={() => (linkOpen = false)}>
					{m.tool_cancel()}
				</button>
			</div>
		</div>
	{/if}
</div>
