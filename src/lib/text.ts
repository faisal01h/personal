export function slugify(input: string) {
	const slug = input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
	return slug || 'post';
}

export function plainText(html: string) {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\s+/g, ' ')
		.trim();
}

export function countWords(text: string) {
	if (!text) return 0;
	return text.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(wordCount: number) {
	return Math.max(1, Math.round(wordCount / 200));
}
