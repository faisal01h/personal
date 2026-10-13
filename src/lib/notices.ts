import { m } from '$lib/paraglide/messages.js';

export function noticeMessage(code: string) {
	switch (code) {
		case 'saved':
			return m.toast_saved();
		case 'published':
			return m.toast_published();
		case 'unpublished':
			return m.toast_unpublished();
		case 'deleted':
			return m.toast_deleted();
		case 'welcome':
			return m.toast_welcome();
		case 'signed-out':
			return m.toast_signed_out();
		case 'project-saved':
			return m.toast_project_saved();
		case 'project-published':
			return m.toast_project_published();
		case 'project-hidden':
			return m.toast_project_hidden();
		case 'project-deleted':
			return m.toast_project_deleted();
		default:
			return null;
	}
}

export function formErrorMessage(code: string | undefined) {
	switch (code) {
		case 'missing':
			return m.login_error_missing();
		case 'invalid':
			return m.login_error_invalid();
		case 'title':
			return m.validation_title();
		case 'content':
			return m.validation_content();
		case 'repo':
			return m.validation_repo();
		case 'site':
			return m.validation_site();
		case 'summary':
			return m.validation_summary();
		default:
			return m.login_error_generic();
	}
}
