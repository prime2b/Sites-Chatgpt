// The same 0.8s fade and 20px entrance used on the motorcycle detail pages.
export function initHomeReveal(root, env = window) {
  if (!root) return;
  const reduced = env.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (reduced?.matches || typeof env.IntersectionObserver !== 'function') return;

  const sections = [...root.children].filter(section =>
    section.matches('section:not(.showroom-hero), .quick-links'));
  const pending = new Set();
  let observer;

  function reveal(section) {
    section.classList.remove('is-pending');
    section.classList.add('is-visible');
    pending.delete(section);
    observer?.unobserve(section);
  }
  function stop() {
    pending.forEach(reveal);
    observer?.disconnect();
    root.removeEventListener('focusin', onFocus);
    reduced?.removeEventListener?.('change', onReduce);
    reduced?.removeListener?.(onReduce);
    env.removeEventListener?.('beforeprint', stop);
  }
  function onFocus(event) {
    const section = event.target.closest?.('.home-reveal.is-pending');
    if (section) reveal(section);
    if (!pending.size) stop();
  }
  function onReduce() {
    if (reduced.matches) stop();
  }

  try {
    observer = new env.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
      if (!pending.size) stop();
    }, {threshold: 0.01, rootMargin: '0px 0px -48px 0px'});

    const viewportHeight = env.innerHeight || root.ownerDocument.documentElement.clientHeight;
    sections.forEach(section => {
      section.classList.add('home-reveal');
      // Preserve the catalog's sticky model details while its section fades in.
      if (section.id === 'motos') section.classList.add('home-reveal-stationary');
      // Keep content already in view visible, including restored scroll positions.
      if (section.getBoundingClientRect().top < viewportHeight - 48) return;
      section.classList.add('is-pending');
      pending.add(section);
      observer.observe(section);
    });

    if (!pending.size) {
      stop();
      return;
    }
    root.addEventListener('focusin', onFocus);
    if (reduced?.addEventListener) reduced.addEventListener('change', onReduce);
    else reduced?.addListener?.(onReduce);
    env.addEventListener?.('beforeprint', stop);
  } catch {
    stop();
  }
  return stop;
}

if (typeof document !== 'undefined') {
  initHomeReveal(document.querySelector('body[data-page="home"] #conteudo'));
}
