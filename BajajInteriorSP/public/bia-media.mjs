export function initBIAMedia(root, env = window) {
  if (!root) return;
  const doc = root.ownerDocument;
  const brand = root.querySelector('[data-bia-brand]');
  const image = root.querySelector('[data-bia-image]');
  const poster = root.querySelector('[data-bia-poster]');
  const video = root.querySelector('[data-bia-video]');
  const youtube = root.querySelector('[data-bia-youtube]');
  const button = root.querySelector('[data-bia-play]');
  const sound = root.querySelector('[data-bia-sound]');
  const soundLabel = root.querySelector('[data-bia-sound-label]');
  const status = root.querySelector('[data-bia-status]');
  const autoplay = !!video && root.dataset.biaAutoplay === 'true';
  const reduced = env.matchMedia?.('(prefers-reduced-motion: reduce)');
  const connection = env.navigator?.connection;
  let iframe = null, pending = false, needsReload = false, started = false;
  let visible = !autoplay || typeof env.IntersectionObserver !== 'function';
  let manuallyPaused = false, completed = false;

  function showBrand() {
    if (brand) brand.hidden = false;
    if (image) image.hidden = true;
    if (poster) poster.hidden = true;
  }
  function message(text) {
    if (!status) return;
    status.textContent = text;
    status.hidden = !text;
  }
  function pause() {
    if (video && !video.paused) video.pause();
    iframe?.contentWindow?.postMessage(JSON.stringify({event: 'command', func: 'pauseVideo', args: []}), 'https://www.youtube-nocookie.com');
  }
  function showPoster() {
    if (video) video.hidden = true;
    if (sound) sound.hidden = true;
    if (poster) {
      poster.hidden = false;
      if (poster.complete && poster.naturalWidth === 0) showBrand();
    } else showBrand();
  }
  function fail() {
    const refocus = doc.activeElement === video || doc.activeElement === iframe || doc.activeElement === button || doc.activeElement === sound;
    pending = false;
    needsReload = true;
    pause();
    showPoster();
    if (youtube) youtube.hidden = true;
    if (button) {
      button.hidden = false;
      button.disabled = false;
      if (refocus) button.focus();
    }
    message('Não foi possível reproduzir a apresentação. Tente novamente ou converse com a BIA pelo botão de atendimento.');
  }
  function updateSound() {
    if (!sound || !video) return;
    const audible = !video.muted && video.volume > 0;
    sound.setAttribute('aria-pressed', String(audible));
    sound.setAttribute('aria-label', audible ? 'Silenciar a apresentação da BIA' : 'Ativar áudio da apresentação da BIA');
    if (soundLabel) soundLabel.textContent = audible ? 'Silenciar' : 'Ativar som';
  }
  function showPlayback() {
    if (poster) poster.hidden = true;
    if (brand) brand.hidden = true;
    video.hidden = false;
    button.hidden = true;
    button.disabled = false;
    if (sound) sound.hidden = false;
    updateSound();
    message('');
  }
  const canAutoplay = () => autoplay && visible && !doc.hidden && !reduced?.matches && !connection?.saveData && !manuallyPaused && !completed && !needsReload;
  function syncAutoplay() {
    if (canAutoplay() && video.paused && !pending) start(true);
  }

  for (const img of [image, poster].filter(Boolean)) {
    img.addEventListener('error', () => {
      showBrand();
      message('A imagem está indisponível. Você pode continuar o atendimento com a BIA.');
    });
    if (img.complete && img.naturalWidth === 0) {
      showBrand();
      message('A imagem está indisponível. Você pode continuar o atendimento com a BIA.');
    }
  }
  if (!button) return;
  video?.addEventListener('error', fail);
  video?.addEventListener('playing', () => {
    if (doc.hidden || !visible) {
      pending = false;
      button.disabled = false;
      pause();
      return;
    }
    started = true;
    pending = false;
    showPlayback();
  });
  video?.addEventListener('pause', () => {
    if (visible && !doc.hidden && !video.ended && !pending && !reduced?.matches && !connection?.saveData) manuallyPaused = true;
  });
  video?.addEventListener('play', () => { manuallyPaused = false; completed = false; });
  video?.addEventListener('ended', () => { completed = true; });
  video?.addEventListener('volumechange', updateSound);
  sound?.addEventListener('click', () => {
    if (!video) return;
    const audible = !video.muted && video.volume > 0;
    video.muted = audible;
    if (!audible && video.volume === 0) video.volume = 1;
    updateSound();
    if (!audible && video.ended) start(false);
  });

  async function start(automatic = false) {
    if (pending) return;
    pending = true;
    button.disabled = true;
    if (!automatic) message('Carregando a apresentação…');
    const reload = needsReload;
    needsReload = false;
    if (video) {
      const source = video.querySelector('source[data-src]');
      if (!source) { fail(); return; }
      if (!source.getAttribute('src') || reload) {
        source.setAttribute('src', source.dataset.src);
        video.load();
      }
      // Only an explicit click enables sound; the first viewport entry starts muted.
      if (automatic && !started) video.muted = true;
      if (!automatic) video.muted = false;
      if (video.ended) video.currentTime = 0;
      video.hidden = false;
      try {
        await video.play();
        pending = false;
        button.disabled = false;
        if (doc.hidden || !visible) { pause(); message(''); }
        else if (!video.paused) {
          started = true;
          showPlayback();
          if (!automatic) video.focus();
        }
      } catch (error) {
        pending = false;
        button.disabled = false;
        if (error?.name === 'AbortError' && (doc.hidden || !visible)) return;
        if (automatic && error?.name === 'NotAllowedError') {
          manuallyPaused = true;
          showPoster();
          button.hidden = false;
          message('Toque em assistir para iniciar a apresentação.');
        } else fail();
      }
    } else if (youtube) {
      const id = youtube.dataset.biaYoutube;
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) { fail(); return; }
      if (!iframe || reload) {
        iframe = doc.createElement('iframe');
        iframe.title = youtube.dataset.biaVideoTitle || 'Apresentação da BIA';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.addEventListener('error', fail);
        iframe.addEventListener('load', () => { if (doc.hidden || !visible) pause(); });
        const url = new URL('https://www.youtube-nocookie.com/embed/' + id);
        for (const [key, value] of Object.entries({autoplay: '1', playsinline: '1', controls: '1', rel: '0', enablejsapi: '1'})) url.searchParams.set(key, value);
        if (env.location?.origin) url.searchParams.set('origin', env.location.origin);
        iframe.src = url.href;
        youtube.replaceChildren(iframe);
      }
      youtube.hidden = false;
      if (poster) poster.hidden = true;
      if (brand) brand.hidden = true;
      button.hidden = true;
      button.disabled = false;
      pending = false;
      message('');
      iframe.focus();
    } else fail();
  }
  button.addEventListener('click', () => start(false));
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) pause(); else syncAutoplay(); });
  env.addEventListener?.('pagehide', pause);
  env.addEventListener?.('pageshow', syncAutoplay);
  function onPreferenceChange() {
    if (reduced?.matches || connection?.saveData) pause();
    else syncAutoplay();
  }
  reduced?.addEventListener?.('change', onPreferenceChange);
  connection?.addEventListener?.('change', onPreferenceChange);
  if (typeof env.IntersectionObserver === 'function') {
    const observer = new env.IntersectionObserver(entries => {
      for (const entry of entries) {
        const next = entry.isIntersecting && (!autoplay || (entry.intersectionRatio ?? 1) >= 0.45);
        const arrived = next && !visible;
        visible = next;
        if (!visible) pause();
        else {
          if (arrived) { manuallyPaused = false; completed = false; }
          syncAutoplay();
        }
      }
    }, autoplay ? {threshold: [0, 0.45], rootMargin: '-96px 0px -24px 0px'} : {threshold: 0});
    // Observe the player: the full section can exceed a mobile viewport.
    observer.observe(autoplay ? root.querySelector('.bia-stage') || root : root);
  }
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-bia-media-mode]').forEach(root => initBIAMedia(root));
