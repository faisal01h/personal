export function reveal(node: HTMLElement, delay = 0) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
	node.classList.add('reveal');
	node.style.setProperty('--reveal-delay', `${delay}ms`);
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			node.classList.add('is-in');
			observer.disconnect();
		},
		{ threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
	);
	observer.observe(node);
	return {
		destroy() {
			observer.disconnect();
		}
	};
}
