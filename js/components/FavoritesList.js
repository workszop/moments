import { store } from '../store.js';
import { router } from '../router.js';

const TYPE_LABELS = {
  story: 'story',
  compliment: 'compliment',
  sentence: 'message',
  private_thought: 'my thought'
};

const TYPE_CLASSES = {
  story: 'type-story',
  compliment: 'type-compliment',
  sentence: 'type-sentence',
  private_thought: 'type-private_thought'
};

export function FavoritesList(container) {
  const div = document.createElement('div');
  div.className = 'view fade-in';
  div.style.maxWidth = '600px';

  function render() {
    const favs = store.getFavoriteMessages();

    if (favs.length === 0) {
      div.innerHTML = `
        <div class="text-center" style="padding:40px 0">
          <p style="font-size:2rem;margin-bottom:16px">&#9825;</p>
          <h2 class="title-md mb-12">No favorites yet</h2>
          <p class="subtitle mb-24">Tap the heart on any card to save it here.</p>
          <button class="btn-primary" id="favs-go-card">Open a card</button>
        </div>
      `;
      const btn = div.querySelector('#favs-go-card');
      if (btn) btn.addEventListener('click', () => router.navigate('card'));
      return;
    }

    div.innerHTML = `
      <h2 class="title-md mb-8">&#9829; Favorites</h2>
      <p class="subtitle mb-24">${favs.length} saved moment${favs.length !== 1 ? 's' : ''}</p>
      <div class="flex-col gap-16 w-full" id="favs-list"></div>
    `;

    const list = div.querySelector('#favs-list');

    favs.forEach(msg => {
      const typeLabel = TYPE_LABELS[msg.type] || msg.type;
      const typeClass = TYPE_CLASSES[msg.type] || '';

      const card = document.createElement('div');
      card.className = 'card';
      card.style.cursor = 'default';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <span class="chip ${typeClass}" style="font-size:11px">${typeLabel}</span>
          <button class="fav-btn active" data-id="${msg.message_id}" style="color:var(--red)">&#9829;</button>
        </div>
        <p style="font-size:1rem;font-weight:700;line-height:1.6;margin-bottom:10px">
          "${msg.content}"
        </p>
        <p style="font-size:.8rem;font-weight:800;color:#aaa">&mdash; ${msg.author}</p>
      `;
      list.appendChild(card);
    });

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.fav-btn');
      if (btn) {
        store.toggleFavorite(btn.dataset.id);
        render();
      }
    });
  }

  render();
  const unsub = store.subscribe(render);

  container.appendChild(div);

  return () => unsub();
}
