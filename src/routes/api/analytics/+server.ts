import { json } from '@sveltejs/kit';
import { parseAnalyticsEvent, recordEvent } from '$lib/server/analytics';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false });
	}
	const event = parseAnalyticsEvent(body);
	if (!event) return json({ ok: false });
	await recordEvent(request, getClientAddress, event);
	return json({ ok: true });
};
