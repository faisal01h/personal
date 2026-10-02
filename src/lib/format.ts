import { getLocale } from '$lib/paraglide/runtime';

export function formatDate(value: Date | number | null | undefined) {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' }).format(date);
}
