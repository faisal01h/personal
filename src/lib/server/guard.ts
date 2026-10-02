import { redirect, type RequestEvent } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';

export function requireUser(event: RequestEvent) {
	if (!event.locals.user) {
		const next = `${event.url.pathname}${event.url.search}`;
		redirect(303, `${localizeHref('/login')}?next=${encodeURIComponent(next)}`);
	}
	return event.locals.user;
}
