/* Small, local interactions for an explicitly labelled interface concept. */
(() => {
  'use strict';
  const download = window.rackSketchDownload;
  if (download) {
    document.querySelectorAll('[data-trial-download]').forEach(link => {
      link.href = download.url;
      link.setAttribute('aria-label', `${link.textContent.trim()} — ${download.filename}, Windows x64`);
    });
    document.querySelectorAll('[data-trial-version]').forEach(el => { el.textContent = download.version; });
    document.querySelectorAll('[data-trial-size]').forEach(el => { el.textContent = `${(download.sizeBytes / 1048576).toFixed(2).replace('.', ',')} МБ`; });
    document.querySelectorAll('[data-trial-sha256]').forEach(el => { el.textContent = download.sha256; });
  }
  const app = document.querySelector('.product-app');
  const rows = {
    '01': { type: 'Паллетный стеллаж', bays: '4', bayWidth: '2 700', depth: '1 100', height: '4 500', levels: '3' },
    '02': { type: 'Паллетный стеллаж', bays: '4', bayWidth: '2 700', depth: '1 100', height: '4 500', levels: '3' },
    '03': { type: 'Среднегрузовой стеллаж', bays: '6', bayWidth: '1 800', depth: '600', height: '3 000', levels: '4' }
  };
  function selectRow(id) {
    const row = rows[id];
    if (!row) return;
    app.querySelectorAll('[data-select-row], [data-plan-row]').forEach(el => {
      const active = (el.dataset.selectRow || el.dataset.planRow) === id;
      el.classList.toggle('is-selected', active);
      el.setAttribute('aria-pressed', String(active));
    });
    app.querySelectorAll('[data-selected-name]').forEach(el => { el.textContent = `Ряд ${id}`; });
    app.querySelectorAll('[data-property]').forEach(el => { el.textContent = row[el.dataset.property]; });
    const medium = id === '03';
    app.querySelectorAll('[data-front-pallet]').forEach(el => { el.style.display = medium ? 'none' : ''; });
    app.querySelectorAll('[data-front-medium]').forEach(el => { el.style.display = medium ? '' : 'none'; });
    app.querySelectorAll('[data-front-height]').forEach(el => { el.textContent = `${row.height} мм`; el.setAttribute('transform', `translate(87 ${medium ? 295 : 257}) rotate(-90)`); });
    app.querySelectorAll('[data-front-height-bg]').forEach(el => { el.setAttribute('y', medium ? '254' : '216'); });
    app.querySelectorAll('[data-front-dimension]').forEach(el => {
      el.setAttribute('d', medium ? 'M98 220H72m26 150H72M82 220v150m-4-146 8-8m-8 158 8-8' : 'M98 145H72m26 225H72M82 145v225m-4-221 8-8m-8 233 8-8');
    });
    app.querySelectorAll('[data-front-caption]').forEach(el => {
      el.textContent = medium ? '6 секций · 4 уровня · глубина 600 мм' : '4 секции · 3 уровня · глубина 1 100 мм';
    });
    app.querySelectorAll('.mini-front > svg, #panel-front > svg').forEach(el => {
      el.setAttribute('aria-label', `Ряд ${id}. ${row.type}. Секций: ${row.bays}, уровней: ${row.levels}, высота: ${row.height} мм.`);
    });
    app.querySelector('[data-status]').textContent = `Выбран ряд ${id} · ${row.bays} ${medium ? 'секций' : 'секции'}`;
  }
  app.querySelectorAll('[data-select-row], [data-plan-row]').forEach(el => {
    const select = () => selectRow(el.dataset.selectRow || el.dataset.planRow);
    el.addEventListener('click', select);
    if (el.hasAttribute('data-plan-row')) el.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); }
    });
  });
  const tabs = [...app.querySelectorAll('[data-view]')];
  function showView(view, moveFocus = false) {
    tabs.forEach(tab => {
      const active = tab.dataset.view === view;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      app.querySelector(`#panel-${tab.dataset.view}`).hidden = !active;
      if (active && moveFocus) tab.focus();
    });
    app.querySelector('[data-canvas-hint]').textContent = view === 'plan' ? 'Выберите ряд, чтобы увидеть параметры' : 'Конфигурация выбранного ряда';
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); showView(tabs[next].dataset.view, true); }
    });
  });
  document.querySelectorAll('[data-aisle]').forEach(button => {
    button.addEventListener('click', () => {
      const wide = button.dataset.aisle === '3600';
      const bottom = wide ? 262.1 : 248;
      document.querySelector('#moving-row').style.transform = `translateY(${wide ? 14.1 : 0}px)`;
      document.querySelector('#aisle-dimension').setAttribute('d', `M518 134H558M538 134V${bottom}`);
      document.querySelector('#aisle-bottom').setAttribute('d', `M518 ${bottom}H558`);
      document.querySelector('#aisle-label').textContent = wide ? '3 600' : '3 200';
      document.querySelector('[data-aisle-status]').textContent = `Показан проход ${wide ? '3 600' : '3 200'} мм.`;
      document.querySelectorAll('[data-aisle]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
    });
  });
  // Progressive enhancement: content remains visible without JS or IntersectionObserver.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('reveal-ready'); observer.observe(el); }
    });
    motion.addEventListener('change', event => {
      if (event.matches) { observer.disconnect(); document.querySelectorAll('.reveal-ready').forEach(el => el.classList.add('is-visible')); }
    });
    // Anchor navigation and find-in-page should never land on invisible content.
    window.addEventListener('beforeprint', () => document.querySelectorAll('.reveal-ready').forEach(el => el.classList.add('is-visible')));
  }
})();
