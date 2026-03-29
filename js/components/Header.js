import { store } from '../store.js';
import { router } from '../router.js';

export function renderHeader(headerEl) {
  function render() {
    const hasCodes = store.hasAnyCodes();
    const current = router.current();

    headerEl.innerHTML = `
      <div class="header-left">
        <h1><a href="#welcome" style="text-decoration:none;color:inherit">moments</a></h1>
        <p>the app for those we love</p>
      </div>
      <div class="header-right">
        ${hasCodes && current !== 'card'
          ? `<button class="header-btn header-btn-active" id="hdr-card">Open card</button>`
          : ''
        }
      </div>
    `;

    const cardBtn = headerEl.querySelector('#hdr-card');
    if (cardBtn) cardBtn.addEventListener('click', () => router.navigate('card'));
  }

  render();
  store.subscribe(render);
  window.addEventListener('hashchange', render);
}
