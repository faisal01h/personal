import { analyticsReport } from '$lib/server/analytics';
import { requireUser } from '$lib/server/guard';
import { m } from '$lib/paraglide/messages.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const requested = event.url.searchParams.get('range');
	const range = requested === '7' || requested === 'all' ? requested : '30';
	return {
		range,
		report: await analyticsReport(range),
		metaTitle: m.analytics_title()
	};
};
