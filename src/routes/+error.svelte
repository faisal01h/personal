<script lang="ts">
	import { page } from '$app/state';
	import { href } from '$lib/href';
	import { m } from '$lib/paraglide/messages.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
</script>

<div class="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-5 py-20">
	<p class="kicker">{page.status}</p>
	<h1 class="mt-3 font-serif text-5xl tracking-tight">{m.error_title()}</h1>
	<p class="mt-4 text-lg text-muted">{m.error_body()}</p>
	<a class="btn btn-primary mt-8 w-fit" href={href('/')}>
		<ArrowLeft size={16} />
		{m.error_home()}
	</a>
</div>
