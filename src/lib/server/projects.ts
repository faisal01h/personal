import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { project } from '$lib/server/db/schema';

export type PublicProject = {
	id: string;
	title: string;
	summary: string;
	repoUrl: string;
	siteUrl: string;
	owner: string;
	repo: string;
	language: string;
	topics: string[];
	stars: number;
};

export type ProjectRecord = PublicProject & {
	sortOrder: number;
	status: 'draft' | 'published';
	createdAt: Date;
	updatedAt: Date;
};

type ProjectInput = {
	title: string;
	summary: string;
	repoUrl: string;
	siteUrl: string;
	owner: string;
	repo: string;
	language: string;
	topics: string[];
	stars: number;
	sortOrder: number;
	status: 'draft' | 'published';
};

const NAME = /^[A-Za-z0-9_.-]+$/;

function parseTopics(value: string) {
	try {
		const parsed = JSON.parse(value);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item): item is string => typeof item === 'string').slice(0, 8);
	} catch {
		return [];
	}
}

function toRecord(row: typeof project.$inferSelect): ProjectRecord {
	return {
		id: row.id,
		title: row.title,
		summary: row.summary,
		repoUrl: row.repoUrl,
		siteUrl: row.siteUrl,
		owner: row.owner,
		repo: row.repo,
		language: row.language,
		topics: parseTopics(row.topics),
		stars: row.stars,
		sortOrder: row.sortOrder,
		status: row.status,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

function httpsUrl(value: string) {
	try {
		const url = new URL(value.trim());
		if (url.username || url.password || url.protocol !== 'https:') return null;
		if (!url.hostname.includes('.')) return null;
		return url;
	} catch {
		return null;
	}
}

function readRepo(value: string) {
	const url = httpsUrl(value);
	if (!url) return null;
	const host = url.hostname.replace(/^www\./, '');
	const parts = url.pathname
		.replace(/\.git$/, '')
		.split('/')
		.filter(Boolean);
	if (host === 'github.com') {
		const owner = parts[0] ?? '';
		const repo = parts[1] ?? '';
		if (!NAME.test(owner) || !NAME.test(repo)) return null;
		return { href: `https://github.com/${owner}/${repo}`, owner, repo };
	}
	url.hash = '';
	url.search = '';
	url.pathname = `/${parts.join('/')}`.replace(/\/$/, '') || '/';
	return { href: url.toString().replace(/\/$/, ''), owner: '', repo: '' };
}

function cleanTopics(value: string) {
	const seen = new Set<string>();
	const topics: string[] = [];
	for (const part of value.split(',')) {
		const topic = part.trim().replace(/^#/, '').slice(0, 32);
		const key = topic.toLowerCase();
		if (!topic || seen.has(key)) continue;
		seen.add(key);
		topics.push(topic);
		if (topics.length === 8) break;
	}
	return topics;
}

async function githubMeta(owner: string, repo: string) {
	try {
		const response = await fetch(
			`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
			{
				headers: {
					accept: 'application/vnd.github+json',
					'user-agent': 'faisal-hanif-site',
					'x-github-api-version': '2022-11-28'
				},
				signal: AbortSignal.timeout(5000)
			}
		);
		if (!response.ok) return null;
		const data = (await response.json()) as {
			description?: string | null;
			language?: string | null;
			stargazers_count?: number;
			homepage?: string | null;
			topics?: unknown;
		};
		const topics = Array.isArray(data.topics)
			? data.topics.filter((item): item is string => typeof item === 'string')
			: [];
		return {
			description: data.description?.trim() ?? '',
			language: data.language?.trim() ?? '',
			stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : 0,
			homepage: data.homepage?.trim() ?? '',
			topics
		};
	} catch {
		return null;
	}
}

export function readProjectInput(form: FormData, fallbackStatus: 'draft' | 'published') {
	const title = form.get('title')?.toString().trim() ?? '';
	const summary = form.get('summary')?.toString().trim().replace(/\s+/g, ' ') ?? '';
	const repo = readRepo(form.get('repoUrl')?.toString() ?? '');
	const siteRaw = form.get('siteUrl')?.toString().trim() ?? '';
	const intent = form.get('intent')?.toString() ?? 'draft';
	const order = Number.parseInt(form.get('sortOrder')?.toString() ?? '0', 10);

	if (!title || title.length > 120) return { error: 'title' as const };
	if (!repo) return { error: 'repo' as const };
	if (summary.length > 600) return { error: 'summary' as const };

	let siteUrl = '';
	if (siteRaw) {
		const site = httpsUrl(siteRaw);
		if (!site) return { error: 'site' as const };
		site.hash = '';
		siteUrl = site.toString();
	}

	let status = fallbackStatus;
	if (intent === 'draft' || intent === 'unpublish') status = 'draft';
	if (intent === 'publish') status = 'published';

	return {
		input: {
			title,
			summary,
			repoUrl: repo.href,
			siteUrl,
			owner: repo.owner,
			repo: repo.repo,
			language: (form.get('language')?.toString() ?? '').trim().slice(0, 40),
			topics: cleanTopics(form.get('topics')?.toString() ?? ''),
			stars: 0,
			sortOrder: Number.isFinite(order) ? Math.min(999, Math.max(0, order)) : 0,
			status
		} satisfies ProjectInput
	};
}

async function enrich(input: ProjectInput) {
	if (!input.owner || !input.repo) return input;
	const meta = await githubMeta(input.owner, input.repo);
	if (!meta) return input;
	const homepage = meta.homepage ? httpsUrl(meta.homepage) : null;
	return {
		...input,
		summary: input.summary || meta.description.slice(0, 600),
		language: input.language || meta.language.slice(0, 40),
		topics: input.topics.length ? input.topics : cleanTopics(meta.topics.join(',')),
		siteUrl: input.siteUrl || (homepage ? homepage.toString() : ''),
		stars: meta.stars
	};
}

export async function listPublishedProjects() {
	const rows = await db
		.select()
		.from(project)
		.where(eq(project.status, 'published'))
		.orderBy(asc(project.sortOrder), desc(project.updatedAt));
	return rows.map(toRecord);
}

export async function listProjects() {
	const rows = await db
		.select()
		.from(project)
		.orderBy(asc(project.sortOrder), desc(project.updatedAt));
	return rows.map(toRecord);
}

export async function projectStats() {
	const rows = await db
		.select({ status: project.status, total: sql<number>`count(*)` })
		.from(project)
		.groupBy(project.status);
	let published = 0;
	let drafts = 0;
	for (const row of rows) {
		const total = Number(row.total);
		if (row.status === 'published') published = total;
		if (row.status === 'draft') drafts = total;
	}
	return { published, drafts, total: published + drafts };
}

export async function getProject(id: string) {
	const rows = await db.select().from(project).where(eq(project.id, id)).limit(1);
	return rows[0] ? toRecord(rows[0]) : null;
}

export async function deleteProject(id: string) {
	await db.delete(project).where(eq(project.id, id));
}

export async function saveProject(input: ProjectInput, id?: string) {
	const next = await enrich(input);
	const now = new Date();
	const values = {
		title: next.title,
		summary: next.summary,
		repoUrl: next.repoUrl,
		siteUrl: next.siteUrl,
		owner: next.owner,
		repo: next.repo,
		language: next.language,
		topics: JSON.stringify(next.topics),
		stars: next.stars,
		sortOrder: next.sortOrder,
		status: next.status,
		updatedAt: now
	};
	if (!id) {
		const [created] = await db
			.insert(project)
			.values({ ...values, createdAt: now })
			.returning({ id: project.id });
		return created?.id ?? null;
	}
	const existing = await getProject(id);
	if (!existing) return null;
	await db.update(project).set(values).where(eq(project.id, id));
	return id;
}
