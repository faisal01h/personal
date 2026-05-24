<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime';
</script>

<div class="flex flex-col text-center min-h-screen justify-center">
    <h1 class="font-bold">{m.page_title()}</h1>
    <p>{m.page_description()}</p>
    <hr class="w-[20vw] mx-auto my-5" />
    <p>{m.reach_me_intro()}
        <a class="font-semibold hover:underline hover:text-rose-500 transition-all" href="https://www.linkedin.com/in/faisal-hanif" target="_blank" rel="noopener noreferrer">LinkedIn</a>,
        <a class="font-semibold hover:underline hover:text-rose-500 transition-all" href="mailto:faisal01h@gmail.com">Email</a>,
        {m.reach_me_or()}
        <a class="font-semibold hover:underline hover:text-rose-500 transition-all" href="https://github.com/faisal01h" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
</div>
<div class="sticky bottom-0 w-full text-center p-2 bg-linear-to-r from-rose-400 to-rose-600">
    <p class="text-sm text-white">{m.footer_copyright({ year: new Date().getFullYear(), build: import.meta.env.VITE_BUILD_NUMBER || 'unspecified', version: import.meta.env.VITE_SVELTEKIT_VERSION || '' })}</p>
</div>

<div class="fixed top-4 right-4 flex gap-1">
    {#each locales as locale (locale)}
        <button
            onclick={() => setLocale(locale)}
            class="px-3 py-1 text-sm font-semibold rounded-full border transition-all uppercase
                {locale === getLocale()
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'border-rose-400 text-rose-500 hover:bg-rose-500 hover:text-white'}"
        >
            {locale}
        </button>
    {/each}
</div>