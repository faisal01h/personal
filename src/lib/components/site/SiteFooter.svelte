<script lang="ts">
	import { page } from '$app/state';
	import { href } from '$lib/href';
	import { m } from '$lib/paraglide/messages.js';
	const year = new Date().getFullYear();
	const user = $derived(page.data.user);
</script>

<footer class="border-t border-line">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8"
	>
		<p>
			{m.footer_copyright({
				year,
				build: import.meta.env.VITE_BUILD_NUMBER || 'local',
				version: import.meta.env.VITE_SVELTEKIT_VERSION || '2'
			})}
		</p>
		<a class="font-medium text-ink hover:text-rose" href={user ? href('/studio') : href('/login')}>
			{user ? m.nav_studio() : m.nav_sign_in()}
		</a>
	</div>
</footer>
