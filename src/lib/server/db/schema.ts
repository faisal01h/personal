import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const post = sqliteTable(
	'post',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: text('title').notNull(),
		slug: text('slug').notNull().unique(),
		excerpt: text('excerpt').notNull().default(''),
		contentJson: text('content_json').notNull().default(''),
		contentHtml: text('content_html').notNull().default(''),
		status: text('status', { enum: ['draft', 'published'] })
			.notNull()
			.default('draft'),
		locale: text('locale').notNull().default('en'),
		wordCount: integer('word_count').notNull().default(0),
		publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('post_status_locale_idx').on(table.status, table.locale)]
);

export const visitEvent = sqliteTable(
	'visit_event',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		kind: text('kind', { enum: ['impression', 'read', 'click', 'video'] }).notNull(),
		path: text('path').notNull(),
		slug: text('slug'),
		label: text('label'),
		target: text('target'),
		durationMs: integer('duration_ms').notNull().default(0),
		visitorId: text('visitor_id').notNull(),
		fingerprint: text('fingerprint').notNull(),
		country: text('country'),
		region: text('region'),
		city: text('city'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		index('visit_event_kind_idx').on(table.kind),
		index('visit_event_slug_idx').on(table.slug),
		index('visit_event_created_idx').on(table.createdAt),
		index('visit_event_fingerprint_idx').on(table.fingerprint)
	]
);

export * from './auth.schema';
