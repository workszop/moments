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

export function CardViewer(container) {
  const messages = store.getShuffledFeed();

  if (messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'view text-center fade-in';
    empty.innerHTML = `
      <p style="font-size:1.5rem;margin-bottom:16px"></p>
      <h2 class="title-md mb-12">No moments yet</h2>
      <p class="subtitle mb-24">Unlock a code or start your journal to see cards here.</p>
      <button class="btn-primary" id="empty-go-codes">Enter a code</button>
    `;
    container.appendChild(empty);
    empty.querySelector('#empty-go-codes').addEventListener('click', () => router.navigate('codes'));
    return;
  }

  let currentIndex = 0;
  let isFlipped = false;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const view = document.createElement('div');
  view.className = 'view text-center fade-in';

  view.innerHTML = `
    <p class="subtitle mb-24" style="font-size:14px">Tap card to reveal &middot; Swipe for next</p>
    <div class="card-flip-container">
      <div class="card-swipe-wrapper">
        <div class="card-flip" id="moment-card">
          <div class="card-flip-face card-flip-front">
            <p style="font-size:3rem;margin-bottom:16px"></p>
            <p style="font-weight:900;font-size:1.2rem">your moment</p>
            <p style="font-weight:700;font-size:.85rem;opacity:.7;margin-top:8px">tap to reveal</p>
          </div>
          <div class="card-flip-face card-flip-back" id="card-back">
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:24px;display:flex;gap:12px;align-items:center">
      <button class="fav-btn" id="fav-toggle" title="Favorite">Save</button>
      <span style="font-size:13px;font-weight:700;color:#aaa" id="card-counter"></span>
      <button class="btn-secondary btn-small" id="next-card-btn">Next</button>
    </div>
  `;

  container.appendChild(view);

  const card = view.querySelector('#moment-card');
  const cardBack = view.querySelector('#card-back');
  const favBtn = view.querySelector('#fav-toggle');
  const counter = view.querySelector('#card-counter');
  const nextBtn = view.querySelector('#next-card-btn');
  const swipeWrapper = view.querySelector('.card-swipe-wrapper');

  function renderCard() {
    const msg = messages[currentIndex];
    if (!msg) return;

    isFlipped = false;
    card.classList.remove('flipped');
    card.style.transition = 'transform .6s cubic-bezier(.4,.0,.2,1)';
    swipeWrapper.style.transform = '';
    swipeWrapper.style.opacity = '';

    const typeLabel = TYPE_LABELS[msg.type] || msg.type;
    const typeClass = TYPE_CLASSES[msg.type] || '';

    cardBack.innerHTML = `
      <div class="chip ${typeClass}" style="margin-bottom:20px;font-size:12px">${typeLabel}</div>
      <p style="font-size:1.15rem;font-weight:700;line-height:1.6;margin-bottom:20px;color:var(--dark)">
        "${msg.content}"
      </p>
      <p style="font-size:.85rem;font-weight:800;color:#aaa">&mdash; ${msg.author}</p>
    `;

    favBtn.innerHTML = store.isFavorite(msg.message_id) ? 'Saved' : 'Save';
    favBtn.classList.toggle('active', store.isFavorite(msg.message_id));
    favBtn.style.color = store.isFavorite(msg.message_id) ? 'var(--red)' : '#aaa';

    counter.textContent = `${currentIndex + 1} / ${messages.length}`;
  }

  function flipCard() {
    isFlipped = !isFlipped;
    card.classList.toggle('flipped', isFlipped);
    if (isFlipped) {
      store.markSeen(messages[currentIndex].message_id);
    }
  }

  function nextCard() {
    currentIndex = (currentIndex + 1) % messages.length;
    // Slide out animation
    swipeWrapper.style.transition = 'transform .25s ease, opacity .25s ease';
    swipeWrapper.style.transform = 'translateX(-120%)';
    swipeWrapper.style.opacity = '0';

    setTimeout(() => {
      swipeWrapper.style.transition = 'none';
      swipeWrapper.style.transform = 'translateX(120%)';
      requestAnimationFrame(() => {
        swipeWrapper.style.transition = 'transform .25s ease, opacity .25s ease';
        swipeWrapper.style.transform = '';
        swipeWrapper.style.opacity = '';
        renderCard();
      });
    }, 260);
  }

  // Tap to flip
  card.addEventListener('click', (e) => {
    if (isDragging) return;
    flipCard();
  });

  // Favorite toggle
  favBtn.addEventListener('click', () => {
    const msg = messages[currentIndex];
    if (msg) {
      store.toggleFavorite(msg.message_id);
      favBtn.innerHTML = store.isFavorite(msg.message_id) ? 'Saved' : 'Save';
      favBtn.classList.toggle('active', store.isFavorite(msg.message_id));
      favBtn.style.color = store.isFavorite(msg.message_id) ? 'var(--red)' : '#aaa';
    }
  });

  // Next button
  nextBtn.addEventListener('click', nextCard);

  // Touch swipe
  swipeWrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = false;
  }, { passive: true });

  swipeWrapper.addEventListener('touchmove', (e) => {
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    if (Math.abs(diff) > 10) isDragging = true;
    swipeWrapper.style.transform = `translateX(${diff * 0.4}px)`;
    swipeWrapper.style.transition = 'none';
  }, { passive: true });

  swipeWrapper.addEventListener('touchend', () => {
    const diff = currentX - startX;
    if (Math.abs(diff) > 80) {
      nextCard();
    } else {
      swipeWrapper.style.transition = 'transform .2s ease';
      swipeWrapper.style.transform = '';
    }
    setTimeout(() => { isDragging = false; }, 50);
  });

  renderCard();
}
