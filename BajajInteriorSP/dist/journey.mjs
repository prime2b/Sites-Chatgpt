/* Self-contained ownership journey; no requests, storage writes or contact submission. */
export const stopPosition = index => `${12.5 + index * 25}%`;
export function workshopLabel(count) {
  return count ? `Enviar para a oficina (${count})` : 'Falar com a oficina';
}
export function initJourney(root, env = window) {
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const reduced = env.matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = $$('[data-journey-tab]');
  const posts = $$('[data-milepost]');
  const panels = $$('.j-panel');
  const cities = $$('[data-journey-city]');
  const toggle = $('[data-journey-toggle]');
  const services = new Set(['Manutenção']);
  let active = 0, running = !reduced.matches, visible = false, timer;
  const cityNames = {'rio-preto': 'Rio Preto', bauru: 'Bauru'};
  function schedule() {
    env.clearTimeout(timer);
    root.dataset.motionActive = String(visible && !root.ownerDocument.hidden && !reduced.matches);
    if (visible && running && !root.ownerDocument.hidden) {
      timer = env.setTimeout(() => activate((active + 1) % 4), 5000);
    }
  }
  function renderPlayback() {
    root.dataset.paused = String(!running);
    const text = running ? 'Pausar percurso' : 'Rodar percurso';
    $('[data-toggle-label]').textContent = text;
    toggle.setAttribute('aria-label', text);
    $('[data-toggle-icon]').setAttribute('d', running ? 'M8 5v14M16 5v14' : 'm8 5 11 7-11 7Z');
    schedule();
  }
  function pause() { running = false; renderPlayback(); }
  function activate(index, manual = false) {
    if (manual) pause();
    active = index;
    root.dataset.step = String(index);
    root.style.setProperty('--journey-position', stopPosition(index));
    root.style.setProperty('--journey-stop', index + 1);
    $('[data-odometer-label]').textContent = `Parada 0${index + 1} de 04`;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
      posts[i].classList.toggle('is-active', i === index);
      posts[i].classList.toggle('is-passed', i < index);
      posts[i].setAttribute('aria-pressed', String(i === index));
    });
    schedule();
  }
  function setCity(id) {
    cities.forEach(button => {
      const selected = button.dataset.journeyCity === id;
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    $$('[data-city-pin]').forEach(pin => pin.classList.toggle('is-selected', pin.dataset.cityPin === id));
    $('[data-chat-city]').textContent = `${cityNames[id]}.`;
    $('[data-chat-bubble]').setAttribute('aria-label', `Olá! Aqui é a unidade de ${cityNames[id]}. Como podemos ajudar?`);
    const link = $('[data-local-cta]');
    link.firstChild.textContent = `Falar com a unidade de ${cityNames[id]} `;
    link.dataset.city = id; // Prepared context; placeholder href deliberately preserved.
  }
  tabs.forEach((tab, i) => tab.addEventListener('click', () => activate(i, true)));
  posts.forEach((post, i) => post.addEventListener('click', () => activate(i, true)));
  $('.j-tabs').addEventListener('keydown', event => {
    if (!tabs.includes(event.target)) return;
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % 4;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (active + 3) % 4;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 3;
    if (next === undefined) return;
    event.preventDefault();
    activate(next, true);
    tabs[next].focus({preventScroll:true});
  });
  cities.forEach(button => button.addEventListener('click', () => { pause(); setCity(button.dataset.journeyCity); }));
  $('.j-cities').addEventListener('keydown', event => {
    if (!cities.includes(event.target)) return;
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - cities.indexOf(event.target);
    pause(); setCity(cities[next].dataset.journeyCity); cities[next].focus({preventScroll:true});
  });
  $$('[data-journey-service]').forEach(button => button.addEventListener('click', () => {
    pause();
    const service = button.dataset.journeyService;
    services.has(service) ? services.delete(service) : services.add(service);
    button.setAttribute('aria-checked', String(services.has(service)));
    const link = $('[data-workshop-cta]');
    link.firstChild.textContent = `${workshopLabel(services.size)} `;
    link.dataset.services = JSON.stringify([...services]);
  }));
  // Focusing any content pauses too, preventing a focused panel from being replaced.
  for (const type of ['pointerdown', 'focusin', 'keydown', 'click']) {
    root.addEventListener(type, event => {
      if (event.target.closest('button,a,input') && !event.target.closest('[data-journey-toggle]')) pause();
    });
  }
  toggle.addEventListener('click', () => { running = !running; renderPlayback(); });
  root.ownerDocument.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) pause(); });
  const observer = new env.IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .08);
    schedule();
  }, {threshold:[0, .08]});
  observer.observe(root);
  setCity('rio-preto');
  $('[data-workshop-cta]').dataset.services = JSON.stringify([...services]);
  renderPlayback();
  return {pause};
}
if (typeof document !== 'undefined') {
  const root = document.getElementById('vantagens');
  if (root?.classList.contains('ownership-journey')) initJourney(root);
}
