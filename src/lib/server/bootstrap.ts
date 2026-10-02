import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { account, post, user } from '$lib/server/db/schema';

let pending: Promise<void> | null = null;

const seeds = [
	{
		locale: 'en',
		title: 'What this site is for',
		slug: 'what-this-site-is-for',
		excerpt: 'A short note on why this page exists, and what I publish here.',
		paragraphs: [
			'This is my personal site. It holds a short introduction, a way to reach me, and writing I want to keep.',
			'Posts can stay as drafts until they are ready. The public pages are available in English and Indonesian, and each post belongs to one of those languages.',
			'If you are reading this, the publishing desk is working.'
		]
	},
	{
		locale: 'id',
		title: 'Untuk apa situs ini',
		slug: 'untuk-apa-situs-ini',
		excerpt:
			'Catatan singkat tentang mengapa halaman ini ada, dan apa yang saya terbitkan di sini.',
		paragraphs: [
			'Ini situs pribadi saya. Di sini ada perkenalan singkat, cara menghubungi saya, dan tulisan yang ingin saya simpan.',
			'Draf tetap tersembunyi sampai diterbitkan. Halaman publik tersedia dalam bahasa Indonesia dan Inggris, dan setiap tulisan memakai salah satu bahasa itu.',
			'Jika Anda membaca ini, meja tulisnya sudah berjalan.'
		]
	}
];

function docFromParagraphs(paragraphs: string[]) {
	return {
		type: 'doc',
		content: paragraphs.map((text) => ({
			type: 'paragraph',
			content: [{ type: 'text', text }]
		}))
	};
}

export function ensureSite() {
	if (!pending)
		pending = run().catch((error) => {
			pending = null;
			throw error;
		});
	return pending;
}

async function run() {
	await ensureAdmin();
	await ensureSeedPosts();
}

async function ensureAdmin() {
	const email = env.ADMIN_EMAIL?.trim().toLowerCase();
	const password = env.ADMIN_PASSWORD;
	const name = env.ADMIN_NAME?.trim() || 'Faisal Hanif';
	if (!email || !password) return;

	const existing = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email))
		.limit(1);
	if (existing.length) return;

	const id = crypto.randomUUID();
	const now = new Date();
	await db.insert(user).values({
		id,
		name,
		email,
		emailVerified: true,
		createdAt: now,
		updatedAt: now
	});
	await db.insert(account).values({
		id: crypto.randomUUID(),
		accountId: id,
		providerId: 'credential',
		userId: id,
		password: await hashPassword(password),
		createdAt: now,
		updatedAt: now
	});
}

async function ensureSeedPosts() {
	const existing = await db.select({ id: post.id }).from(post).limit(1);
	if (existing.length) return;
	const now = new Date();
	for (const seed of seeds) {
		const json = docFromParagraphs(seed.paragraphs);
		const html = seed.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
		const words = seed.paragraphs.join(' ').split(/\s+/).length;
		await db.insert(post).values({
			title: seed.title,
			slug: seed.slug,
			excerpt: seed.excerpt,
			contentJson: JSON.stringify(json),
			contentHtml: html,
			status: 'published',
			locale: seed.locale,
			wordCount: words,
			publishedAt: now,
			createdAt: now,
			updatedAt: now
		});
	}
}
