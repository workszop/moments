import { store } from '../store.js';
import { router } from '../router.js';

export function Header() {
  const header = document.createElement('header');
  header.className = 'site-header';

  function render() {
    const hasCodes = store.hasAnyCodes();
    const currentView = router.current();
    const showCard = hasCodes && currentView !== 'card';

    header.innerHTML = `
      <a href="#welcome" class="logo-lockup">
        <span class="logo-icon"></span>
        <span class="logo-name">moments</span>
      </a>
      ${showCard
        ? `<button class="btn-primary btn-small nav-cta-btn">
            Open card
           </button>`
        : hasCodes
          ? `<button class="btn-secondary btn-small nav-favs-btn">
              Favorites
             </button>`
          : ''
      }
    `;

    const ctaBtn = header.querySelector('.nav-cta-btn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => router.navigate('card'));
    }

    const favsBtn = header.querySelector('.nav-favs-btn');
    if (favsBtn) {
      favsBtn.addEventListener('click', () => router.navigate('favorites'));
    }
  }

  render();
  const unsub = store.subscribe(render);
  window.addEventListener('hashchange', render);

  header._cleanup = () => {
    unsub();
    window.removeEventListener('hashchange', render);
  };

  return header;
}
