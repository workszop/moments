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
const COLOR_THEMES = {
  story: 'ct-story', compliment: 'ct-compliment',
  sentence: 'ct-sentence', private_thought: 'ct-private_thought'
};

export function CardViewer(container) {
  const messages = store.getShuffledFeed();

  if (messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'view view-center fade-in';
    empty.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
        <p class="empty-title">No moments yet</p>
        <p class="empty-sub">Unlock a code or start your journal to see cards here.</p>
        <button class="btn btn-primary" id="empty-go-codes">Enter a code</button>
      </div>
    `;
    container.appendChild(empty);
    empty.querySelector('#empty-go-codes').addEventListener('click', () => router.navigate('codes'));
    return;
  }

  let currentIndex = 0;
  let isFlipped = false;
  let tsy = 0, tsx = 0;

  const view = document.createElement('div');
  view.className = 'view view-center fade-in';

  view.innerHTML = `
    <div class="card-container card-in" id="card-wrap">
      <div class="card-inner" id="card-inner">
        <div class="card-face card-front">
          <div class="card-front-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <p class="card-front-hint">your moment</p>
          <p class="card-front-sub">tap to reveal</p>
        </div>
        <div class="card-face card-back">
          <div class="print-area" id="card-print-area">
            <div class="q-type" id="card-type-chip"></div>
            <p class="q-text" id="card-text"></p>
            <p class="q-author" id="card-author"></p>
          </div>
        </div>
      </div>
      <div class="swipe-hint" id="swipe-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l7-7 7 7"/></svg>
        <span>Swipe up for next</span>
      </div>
    </div>

    <div class="actions w-full">
      <button class="btn btn-secondary fav-btn" id="fav-toggle">Save</button>
      <button class="btn btn-primary" id="next-card-btn" style="flex:1">
        Next
        <span class="hint" id="card-counter" style="color:rgba(255,255,255,.6)"></span>
      </button>
    </div>
  `;

  container.appendChild(view);

  const cardWrap = view.querySelector('#card-wrap');
  const cardInner = view.querySelector('#card-inner');
  const cardText = view.querySelector('#card-text');
  const cardAuthor = view.querySelector('#card-author');
  const cardTypeChip = view.querySelector('#card-type-chip');
  const favBtn = view.querySelector('#fav-toggle');
  const counter = view.querySelector('#card-counter');
  const nextBtn = view.querySelector('#next-card-btn');
  const swipeHint = view.querySelector('#swipe-hint');

  function renderCard() {
    const msg = messages[currentIndex];
    if (!msg) return;

    isFlipped = false;
    cardInner.classList.remove('flipped');

    // Color theme
    Object.values(COLOR_THEMES).forEach(c => cardWrap.classList.remove(c));
    cardWrap.classList.add(COLOR_THEMES[msg.type] || 'ct-sentence');

    const typeLabel = TYPE_LABELS[msg.type] || msg.type;
    const typeClass = TYPE_CLASSES[msg.type] || '';
    cardTypeChip.innerHTML = `<span class="chip ${typeClass}">${typeLabel}</span>`;
    cardText.textContent = `"${msg.content}"`;
    cardAuthor.textContent = `\u2014 ${msg.author}`;

    const isFav = store.isFavorite(msg.message_id);
    favBtn.textContent = isFav ? 'Saved' : 'Save';
    favBtn.classList.toggle('fav-btn-active', isFav);

    counter.textContent = `${currentIndex + 1}/${messages.length}`;

    swipeHint.classList.remove('visible');
  }

  function flipCard() {
    if (isFlipped) return;
    isFlipped = true;
    cardInner.classList.add('flipped');
    store.markSeen(messages[currentIndex].message_id);
    if (navigator.vibrate) navigator.vibrate(10);
    swipeHint.classList.add('visible');
  }

  function nextCard() {
    currentIndex = (currentIndex + 1) % messages.length;
    // Re-trigger card-in animation
    cardWrap.classList.remove('card-in');
    void cardWrap.offsetWidth;
    cardWrap.classList.add('card-in');
    renderCard();
  }

  function handleCardTap() {
    if (!isFlipped) flipCard();
    else if (messages.length > 1) nextCard();
  }

  cardInner.addEventListener('click', handleCardTap);

  favBtn.addEventListener('click', () => {
    const msg = messages[currentIndex];
    if (!msg) return;
    store.toggleFavorite(msg.message_id);
    const isFav = store.isFavorite(msg.message_id);
    favBtn.textContent = isFav ? 'Saved' : 'Save';
    favBtn.classList.toggle('fav-btn-active', isFav);
    window.showToast(isFav ? 'Saved to favorites' : 'Removed from favorites');
  });

  nextBtn.addEventListener('click', () => {
    if (messages.length > 1) nextCard();
  });

  // Touch swipe (up for next)
  const area = view;
  area.addEventListener('touchstart', (e) => {
    tsy = e.touches[0].clientY;
    tsx = e.touches[0].clientX;
  }, { passive: true });
  area.addEventListener('touchend', (e) => {
    const dy = tsy - e.changedTouches[0].clientY;
    const dx = Math.abs(tsx - e.changedTouches[0].clientX);
    if (dy > 60 && dy > dx) {
      if (isFlipped) { if (messages.length > 1) nextCard(); }
      else flipCard();
    }
  }, { passive: true });

  renderCard();
}
