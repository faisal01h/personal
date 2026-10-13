import { getLocale } from '$lib/paraglide/runtime';

export function formatDate(value: Date | number | string | null | undefined) {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' }).format(date);
}

export function isoDate(value: Date | number | string | null | undefined) {
	if (!value) return undefined;
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;
	return date.toISOString();
}
