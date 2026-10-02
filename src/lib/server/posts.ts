import { and, desc, eq, like, or, sql } from 'drizzle-orm';
import sanitizeHtml from 'sanitize-html';
import { countWords, plainText, slugify } from '$lib/text';
import { db } from '$lib/server/db';
import { post } from '$lib/server/db/schema';

const summaryColumns = {
	id: post.id,
	title: post.title,
	slug: post.slug,
	excerpt: post.excerpt,
	status: post.status,
	locale: post.locale,
	wordCount: post.wordCount,
	publishedAt: post.publishedAt,
	createdAt: post.createdAt,
	updatedAt: post.updatedAt
};

export type PostSummary = {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	status: 'draft' | 'published';
	locale: string;
	wordCount: number;
	publishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

export type PostRecord = PostSummary & {
	contentJson: string;
	contentHtml: string;
};

const LOCALES = new Set(['en', 'id']);

function cleanHtml(html: string) {
	return sanitizeHtml(html, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'hr', 'video']),
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			a: ['href', 'name', 'target', 'rel'],
			img: ['src', 'alt', 'width', 'height'],
			video: ['src', 'controls', 'preload', 'playsinline'],
			td: ['colspan', 'rowspan'],
			th: ['colspan', 'rowspan'],
			'*': ['class']
		},
		allowedSchemes: ['http', 'https', 'mailto']
	});
}

function makeExcerpt(explicit: string, html: string) {
	const given = explicit.trim().replace(/\s+/g, ' ');
	if (given) return given.slice(0, 280);
	const text = plainText(html);
	if (text.length <= 180) return text;
	return `${text.slice(0, 177).trimEnd()}…`;
}

async function uniqueSlug(base: string, ignoreId?: string) {
	let candidate = base;
	let suffix = 2;
	while (true) {
		const found = await db
			.select({ id: post.id })
			.from(post)
			.where(eq(post.slug, candidate))
			.limit(1);
		if (!found.length || found[0].id === ignoreId) return candidate;
		candidate = `${base}-${suffix++}`.slice(0, 96);
	}
}

export async function listPublished(limit?: number) {
	const query = db
		.select(summaryColumns)
		.from(post)
		.where(eq(post.status, 'published'))
		.orderBy(desc(post.publishedAt));
	const rows = limit ? await query.limit(limit) : await query;
	return rows as PostSummary[];
}

export async function listManaged(filters: { q?: string; status?: string; locale?: string }) {
	const conditions = [];
	if (filters.status === 'draft' || filters.status === 'published') {
		conditions.push(eq(post.status, filters.status));
	}
	if (filters.locale === 'en' || filters.locale === 'id') {
		conditions.push(eq(post.locale, filters.locale));
	}
	const q = filters.q?.trim();
	if (q) {
		const term = `%${q.replace(/[%_]/g, '')}%`;
		conditions.push(or(like(post.title, term), like(post.slug, term), like(post.excerpt, term)));
	}
	const rows = await db
		.select(summaryColumns)
		.from(post)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(desc(post.updatedAt));
	return rows as PostSummary[];
}

export async function postStats() {
	const rows = await db
		.select({
			status: post.status,
			total: sql<number>`count(*)`
		})
		.from(post)
		.groupBy(post.status);
	let published = 0;
	let drafts = 0;
	for (const row of rows) {
		const total = Number(row.total);
		if (row.status === 'published') published = total;
		if (row.status === 'draft') drafts = total;
	}
	return { published, drafts, total: published + drafts };
}

export async function getPublishedBySlug(slug: string) {
	const rows = await db
		.select()
		.from(post)
		.where(and(eq(post.slug, slug), eq(post.status, 'published')))
		.limit(1);
	return (rows[0] as PostRecord | undefined) ?? null;
}

export async function getPost(id: string) {
	const rows = await db.select().from(post).where(eq(post.id, id)).limit(1);
	return (rows[0] as PostRecord | undefined) ?? null;
}

export async function deletePost(id: string) {
	await db.delete(post).where(eq(post.id, id));
}

export type PostInput = {
	title: string;
	slug: string;
	excerpt: string;
	contentJson: string;
	contentHtml: string;
	locale: string;
	status: 'draft' | 'published';
};

export function readPostInput(
	form: FormData,
	fallbackStatus: 'draft' | 'published',
	fallbackLocale = 'en'
) {
	const title = form.get('title')?.toString().trim() ?? '';
	const excerpt = form.get('excerpt')?.toString() ?? '';
	const localeValue = form.get('locale')?.toString() ?? fallbackLocale;
	const intent = form.get('intent')?.toString() ?? 'draft';
	const rawJson = form.get('contentJson')?.toString() ?? '';
	const rawHtml = form.get('contentHtml')?.toString() ?? '';

	if (!title || title.length > 160) return { error: 'title' as const };
	if (rawHtml.length > 400_000 || rawJson.length > 400_000) return { error: 'content' as const };

	let contentJson: string;
	try {
		const parsed = JSON.parse(rawJson || '{"type":"doc","content":[{"type":"paragraph"}]}');
		if (!parsed || parsed.type !== 'doc') return { error: 'content' as const };
		contentJson = JSON.stringify(parsed);
	} catch {
		return { error: 'content' as const };
	}

	const contentHtml = cleanHtml(rawHtml);
	const text = plainText(contentHtml);
	const hasMedia = /<(?:img|video)\b/i.test(contentHtml);
	if (
		(intent === 'publish' || fallbackStatus === 'published') &&
		intent !== 'unpublish' &&
		!text &&
		!hasMedia
	) {
		return { error: 'content' as const };
	}

	let status = fallbackStatus;
	if (intent === 'draft' || intent === 'unpublish') status = 'draft';
	if (intent === 'publish') status = 'published';

	const locale = LOCALES.has(localeValue) ? localeValue : 'en';
	const slugSource = form.get('slug')?.toString().trim() || title;

	return {
		input: {
			title,
			slug: slugify(slugSource),
			excerpt: makeExcerpt(excerpt, contentHtml),
			contentJson,
			contentHtml,
			locale,
			status
		} satisfies PostInput
	};
}

export async function savePost(input: PostInput, id?: string) {
	const now = new Date();
	const wordCount = countWords(plainText(input.contentHtml));
	if (!id) {
		const slug = await uniqueSlug(input.slug);
		const [created] = await db
			.insert(post)
			.values({
				title: input.title,
				slug,
				excerpt: input.excerpt,
				contentJson: input.contentJson,
				contentHtml: input.contentHtml,
				status: input.status,
				locale: input.locale,
				wordCount,
				publishedAt: input.status === 'published' ? now : null,
				createdAt: now,
				updatedAt: now
			})
			.returning();
		return created;
	}

	const existing = await getPost(id);
	if (!existing) return null;
	const slug = await uniqueSlug(input.slug, id);
	const publishedAt =
		input.status === 'published' ? (existing.publishedAt ?? now) : existing.publishedAt;
	await db
		.update(post)
		.set({
			title: input.title,
			slug,
			excerpt: input.excerpt,
			contentJson: input.contentJson,
			contentHtml: input.contentHtml,
			status: input.status,
			locale: input.locale,
			wordCount,
			publishedAt,
			updatedAt: now
		})
		.where(eq(post.id, id));
	return getPost(id);
}
