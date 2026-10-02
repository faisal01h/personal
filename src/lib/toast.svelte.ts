export type ToastKind = 'success' | 'error' | 'message';

export type ToastItem = {
	id: number;
	message: string;
	kind: ToastKind;
};

let nextId = 0;

class ToastStore {
	items = $state<ToastItem[]>([]);

	push(kind: ToastKind, message: string) {
		const id = ++nextId;
		this.items.push({ id, message, kind });
		setTimeout(() => {
			this.items = this.items.filter((item) => item.id !== id);
		}, 4500);
	}

	success(message: string) {
		this.push('success', message);
	}

	error(message: string) {
		this.push('error', message);
	}

	message(message: string) {
		this.push('message', message);
	}

	dismiss(id: number) {
		this.items = this.items.filter((item) => item.id !== id);
	}
}

export const toast = new ToastStore();
