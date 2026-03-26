import { store } from '../store.js';
import { router } from '../router.js';

const TYPE_LABELS = {
  story: 'story', compliment: 'compliment',
  sentence: 'message', private_thought: 'my thought'
};
const TYPE_CLASSES = {
  story: 'type-story', compliment: 'type-compliment',
  sentence: 'type-sentence', private_thought: 'type-private_thought'
};

export function FavoritesList(container) {
  const div = document.createElement('div');
  div.className = 'view view-scroll fade-in';

  function render() {
    const favs = store.getFavoriteMessages();

    if (favs.length === 0) {
      div.innerHTML = `
        <div class="empty-state" style="padding:40px 0">
          <div class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <p class="empty-title">No favorites yet</p>
          <p class="empty-sub">Tap Save on any card to keep it here.</p>
          <button class="btn btn-primary" id="favs-go-card">Open a card</button>
        </div>
      `;
      const btn = div.querySelector('#favs-go-card');
      if (btn) btn.addEventListener('click', () => router.navigate('card'));
      return;
    }

    div.innerHTML = `
      <div class="mb-16">
        <div class="title mb-4">Favorites</div>
        <p class="subtitle">${favs.length} saved moment${favs.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="flex-col gap-10 w-full" id="favs-list"></div>
    `;

    const list = div.querySelector('#favs-list');
    favs.forEach(msg => {
      const typeLabel = TYPE_LABELS[msg.type] || msg.type;
      const typeClass = TYPE_CLASSES[msg.type] || '';

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="flex-between mb-8">
          <span class="chip ${typeClass}">${typeLabel}</span>
          <button class="header-btn" data-id="${msg.message_id}" style="font-size:11px;padding:5px 10px">Remove</button>
        </div>
        <p style="font-size:14px;font-weight:700;line-height:1.6;margin-bottom:8px">
          "${msg.content}"
        </p>
        <p style="font-size:12px;font-weight:800;color:#aaa">&mdash; ${msg.author}</p>
      `;
      list.appendChild(card);
    });

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-id]');
      if (btn) {
        store.toggleFavorite(btn.dataset.id);
        window.showToast('Removed from favorites');
        render();
      }
    });
  }

  render();
  const unsub = store.subscribe(render);
  container.appendChild(div);
  return () => unsub();
}
