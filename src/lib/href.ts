import { resolve } from '$app/paths';
import type { Pathname, ResolvedPathname } from '$app/types';
import { localizeHref } from '$lib/paraglide/runtime';

export function href(path: string): ResolvedPathname {
	const hashIndex = path.indexOf('#');
	const beforeHash = hashIndex === -1 ? path : path.slice(0, hashIndex);
	const hash = hashIndex === -1 ? '' : path.slice(hashIndex);
	const queryIndex = beforeHash.indexOf('?');
	const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
	const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex);
	return resolve(`${localizeHref(pathname || '/')}${query}${hash}` as Pathname);
}

export function safeNext(value: string | null) {
	if (!value) return href('/studio');
	if (
		!value.startsWith('/') ||
		value.startsWith('//') ||
		value.includes('\\') ||
		value.includes('://')
	) {
		return href('/studio');
	}
	if (value === '/login' || value.startsWith('/login?') || value.startsWith('/login#')) {
		return href('/studio');
	}
	return value;
}
