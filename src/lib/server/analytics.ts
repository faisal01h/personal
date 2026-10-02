import { and, desc, eq, gte, sql } from 'drizzle-orm';
import geoip from 'geoip-lite';
import { db } from '$lib/server/db';
import { post, visitEvent } from '$lib/server/db/schema';

const KINDS = new Set(['impression', 'read', 'click', 'video']);
const LABELS = new Set(['github', 'linkedin', 'email', 'article']);
const FINGERPRINT = /^[a-f0-9]{64}$/;
const VISITOR = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const buckets = new Map<string, { count: number; reset: number }>();

export type AnalyticsEvent = {
	kind: 'impression' | 'read' | 'click' | 'video';
	path: string;
	slug: string | null;
	label: string | null;
	target: string | null;
	durationMs: number;
	visitorId: string;
	fingerprint: string;
};

function clientAddress(request: Request, getClientAddress: () => string) {
	const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
	const raw = forwarded || request.headers.get('x-real-ip') || safeAddress(getClientAddress);
	return raw.replace(/^::ffff:/, '');
}

function safeAddress(getClientAddress: () => string) {
	try {
		return getClientAddress();
	} catch {
		return '';
	}
}

function place(ip: string) {
	if (
		!ip ||
		ip === '127.0.0.1' ||
		ip === '::1' ||
		ip.startsWith('192.168.') ||
		ip.startsWith('10.')
	) {
		return { country: null, region: null, city: null };
	}
	const geo = geoip.lookup(ip);
	if (!geo) return { country: null, region: null, city: null };
	return {
		country: geo.country || null,
		region: geo.region || null,
		city: geo.city || null
	};
}

function allow(fingerprint: string) {
	const now = Date.now();
	const bucket = buckets.get(fingerprint);
	if (!bucket || bucket.reset < now) {
		buckets.set(fingerprint, { count: 1, reset: now + 60_000 });
		return true;
	}
	bucket.count += 1;
	return bucket.count <= 180;
}

export function parseAnalyticsEvent(body: unknown): AnalyticsEvent | null {
	if (!body || typeof body !== 'object') return null;
	const value = body as Record<string, unknown>;
	const kind = value.kind;
	const path = value.path;
	const visitorId = value.visitorId;
	const fingerprint = value.fingerprint;
	if (typeof kind !== 'string' || !KINDS.has(kind)) return null;
	if (typeof path !== 'string' || !path.startsWith('/') || path.length > 200 || path.includes('..'))
		return null;
	if (typeof visitorId !== 'string' || !VISITOR.test(visitorId)) return null;
	if (typeof fingerprint !== 'string' || !FINGERPRINT.test(fingerprint)) return null;

	const slug =
		typeof value.slug === 'string' && /^[a-z0-9-]{1,96}$/.test(value.slug) ? value.slug : null;
	const label = typeof value.label === 'string' && LABELS.has(value.label) ? value.label : null;
	const target =
		typeof value.target === 'string' ? value.target.replace(/\s+/g, ' ').slice(0, 500) : null;
	let durationMs = typeof value.durationMs === 'number' ? Math.round(value.durationMs) : 0;
	if (kind === 'impression' || kind === 'click') durationMs = 0;
	if (durationMs < 0 || durationMs > 120_000) return null;
	if ((kind === 'read' || kind === 'video') && durationMs < 500) return null;

	return {
		kind: kind as AnalyticsEvent['kind'],
		path,
		slug,
		label,
		target,
		durationMs,
		visitorId,
		fingerprint
	};
}

export async function recordEvent(
	request: Request,
	getClientAddress: () => string,
	event: AnalyticsEvent
) {
	const userAgent = request.headers.get('user-agent') ?? '';
	if (/bot|crawl|spider|preview|headless/i.test(userAgent)) return;
	if (!allow(event.fingerprint)) return;
	const where = place(clientAddress(request, getClientAddress));
	await db.insert(visitEvent).values({
		kind: event.kind,
		path: event.path,
		slug: event.slug,
		label: event.label,
		target: event.target,
		durationMs: event.durationMs,
		visitorId: event.visitorId,
		fingerprint: event.fingerprint,
		country: where.country,
		region: where.region,
		city: where.city
	});
}

function since(range: string) {
	if (range === '7') return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	if (range === '30') return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	return null;
}

function number(value: unknown) {
	const parsed = Number(value ?? 0);
	return Number.isFinite(parsed) ? parsed : 0;
}

export async function analyticsReport(range: string) {
	const start = since(range);
	const period = start ? gte(visitEvent.createdAt, start) : undefined;
	const where = (...extra: ReturnType<typeof eq>[]) =>
		period ? and(period, ...extra) : extra.length ? and(...extra) : undefined;

	const [impressions, readers, readTime, videoTime, uniqueVisitors] = await Promise.all([
		db
			.select({ total: sql<number>`count(*)` })
			.from(visitEvent)
			.where(where(eq(visitEvent.kind, 'impression'))),
		db
			.select({ total: sql<number>`count(distinct ${visitEvent.fingerprint})` })
			.from(visitEvent)
			.where(where(eq(visitEvent.kind, 'read'))),
		db
			.select({ total: sql<number>`coalesce(sum(${visitEvent.durationMs}), 0)` })
			.from(visitEvent)
			.where(where(eq(visitEvent.kind, 'read'))),
		db
			.select({ total: sql<number>`coalesce(sum(${visitEvent.durationMs}), 0)` })
			.from(visitEvent)
			.where(where(eq(visitEvent.kind, 'video'))),
		db
			.select({ total: sql<number>`count(distinct ${visitEvent.fingerprint})` })
			.from(visitEvent)
			.where(period)
	]);

	const readMs = number(readTime[0]?.total);
	const readerCount = number(readers[0]?.total);

	const countries = await db
		.select({
			country: visitEvent.country,
			visitors: sql<number>`count(distinct ${visitEvent.fingerprint})`
		})
		.from(visitEvent)
		.where(period)
		.groupBy(visitEvent.country)
		.orderBy(desc(sql`count(distinct ${visitEvent.fingerprint})`))
		.limit(12);

	const cities = await db
		.select({
			city: visitEvent.city,
			region: visitEvent.region,
			country: visitEvent.country,
			visitors: sql<number>`count(distinct ${visitEvent.fingerprint})`
		})
		.from(visitEvent)
		.where(period)
		.groupBy(visitEvent.city, visitEvent.region, visitEvent.country)
		.orderBy(desc(sql`count(distinct ${visitEvent.fingerprint})`))
		.limit(12);

	const interest = await db
		.select({
			label: visitEvent.label,
			clicks: sql<number>`count(*)`
		})
		.from(visitEvent)
		.where(where(eq(visitEvent.kind, 'click'), eq(visitEvent.path, '/')))
		.groupBy(visitEvent.label)
		.orderBy(desc(sql`count(*)`));

	const articleLinks = await db
		.select({
			target: visitEvent.target,
			clicks: sql<number>`count(*)`
		})
		.from(visitEvent)
		.where(where(eq(visitEvent.kind, 'click'), eq(visitEvent.label, 'article')))
		.groupBy(visitEvent.target)
		.orderBy(desc(sql`count(*)`))
		.limit(12);

	const postRows = await db
		.select({
			slug: visitEvent.slug,
			impressions: sql<number>`sum(case when ${visitEvent.kind} = 'impression' then 1 else 0 end)`,
			readMs: sql<number>`sum(case when ${visitEvent.kind} = 'read' then ${visitEvent.durationMs} else 0 end)`,
			readers: sql<number>`count(distinct case when ${visitEvent.kind} = 'read' then ${visitEvent.fingerprint} end)`,
			videoMs: sql<number>`sum(case when ${visitEvent.kind} = 'video' then ${visitEvent.durationMs} else 0 end)`,
			linkClicks: sql<number>`sum(case when ${visitEvent.kind} = 'click' and ${visitEvent.label} = 'article' then 1 else 0 end)`
		})
		.from(visitEvent)
		.where(
			period
				? and(period, sql`${visitEvent.slug} is not null`)
				: sql`${visitEvent.slug} is not null`
		)
		.groupBy(visitEvent.slug)
		.orderBy(desc(sql`sum(case when ${visitEvent.kind} = 'impression' then 1 else 0 end)`));

	const titles = await db.select({ slug: post.slug, title: post.title }).from(post);
	const titleBySlug = new Map(titles.map((item) => [item.slug, item.title]));

	return {
		impressions: number(impressions[0]?.total),
		uniqueVisitors: number(uniqueVisitors[0]?.total),
		readMs,
		averageReadMs: readerCount ? Math.round(readMs / readerCount) : 0,
		videoMs: number(videoTime[0]?.total),
		countries: countries.map((row) => ({
			country: row.country,
			visitors: number(row.visitors)
		})),
		cities: cities.map((row) => ({
			city: row.city,
			region: row.region,
			country: row.country,
			visitors: number(row.visitors)
		})),
		interest: interest
			.filter((row) => row.label && row.label !== 'article')
			.map((row) => ({ label: row.label as string, clicks: number(row.clicks) })),
		articleLinks: articleLinks.map((row) => ({
			target: row.target ?? '',
			clicks: number(row.clicks)
		})),
		posts: postRows.map((row) => {
			const readersForPost = number(row.readers);
			const read = number(row.readMs);
			return {
				slug: row.slug ?? '',
				title: titleBySlug.get(row.slug ?? '') ?? row.slug ?? '',
				impressions: number(row.impressions),
				readMs: read,
				averageReadMs: readersForPost ? Math.round(read / readersForPost) : 0,
				videoMs: number(row.videoMs),
				linkClicks: number(row.linkClicks)
			};
		})
	};
}
