import { store } from '../store.js';
import { router } from '../router.js';


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
  view.className = 'view fade-in';

  view.innerHTML = `
    <div class="card-area" id="card-area">
      <div class="card-container card-in" id="card-wrap">
        <div class="card-inner" id="card-inner">
          <div class="card-face card-front">
            <p class="card-front-hint">a moment</p>
            <p class="card-front-sub">tap to reveal</p>
          </div>
          <div class="card-face card-back">
            <div class="print-area" id="card-print-area">
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
    </div>

    <div class="actions w-full">
      <button class="btn btn-secondary" id="my-codes-btn">My codes</button>
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
  const counter = view.querySelector('#card-counter');
  const nextBtn = view.querySelector('#next-card-btn');
  const swipeHint = view.querySelector('#swipe-hint');

  function renderCard() {
    const msg = messages[currentIndex];
    if (!msg) return;

    isFlipped = false;
    cardInner.classList.remove('flipped');

    cardText.textContent = `"${msg.content}"`;
    cardAuthor.textContent = `\u2014 ${msg.author}`;

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

  view.querySelector('#my-codes-btn').addEventListener('click', () => router.navigate('my-codes'));

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
