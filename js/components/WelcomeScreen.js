import { router } from '../router.js';
import { store } from '../store.js';

export function WelcomeScreen(container) {
  const div = document.createElement('div');
  div.className = 'view view-scroll fade-in';

  const hasCodes = store.hasAnyCodes();

  div.innerHTML = `
    <!-- HERO -->
    <div class="home-hero">
      <div class="home-hero-label">pick-me-up cards</div>
      <h2 class="home-hero-title">moments</h2>
      <p class="home-hero-sub">
        A card deck filled with words from people who care about you.
        Messages, memories, compliments &mdash; one card at a time.
      </p>
      <div class="flex-col gap-10 w-full mt-16">
        ${hasCodes ? `
          <button class="btn btn-primary btn-full" id="welcome-open-card">
            Open today's card
          </button>
        ` : ''}
        <button class="btn ${hasCodes ? 'btn-secondary' : 'btn-primary'} btn-full" id="welcome-enter-code">
          I have a code
        </button>
      </div>
    </div>

    <!-- WHAT IS IT -->
    <div class="home-section">
      <div class="home-section-label">What is moments?</div>
      <p class="home-body">
        Moments is a pick-me-up card app. Someone who cares about you
        fills a deck with personal messages &mdash; then gives you a code.
        You open one card at a time, whenever you need a boost.
      </p>
      <p class="home-body">
        Think of it as a box of letters you can carry in your pocket.
      </p>
    </div>

    <!-- HOW IT WORKS -->
    <div class="home-section">
      <div class="home-section-label">How it works</div>
      <div class="home-steps">
        <div class="home-step">
          <div class="home-step-num">1</div>
          <div>
            <p class="home-step-title">Someone creates a gift</p>
            <p class="home-step-desc">They write messages, memories, and compliments just for you.</p>
          </div>
        </div>
        <div class="home-step">
          <div class="home-step-num">2</div>
          <div>
            <p class="home-step-title">You get a code</p>
            <p class="home-step-desc">A short access code unlocks your personal card deck.</p>
          </div>
        </div>
        <div class="home-step">
          <div class="home-step-num">3</div>
          <div>
            <p class="home-step-title">Open a card anytime</p>
            <p class="home-step-desc">Tap to reveal. Swipe for the next one. Carry warmth with you.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- WHAT YOU CAN DO -->
    <div class="home-section">
      <div class="home-section-label">What you can do</div>
      <div class="flex-col gap-10 w-full">
        <div class="home-feature" id="feat-code">
          <div class="home-feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <p class="home-feature-title">Unlock a deck</p>
            <p class="home-feature-desc">Enter a code to reveal your personal card collection.</p>
          </div>
        </div>
        <div class="home-feature" id="feat-create">
          <div class="home-feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
          </div>
          <div>
            <p class="home-feature-title">Create a gift</p>
            <p class="home-feature-desc">Write moments for someone you love and give them a code.</p>
          </div>
        </div>
        <div class="home-feature" id="feat-journal">
          <div class="home-feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div>
            <p class="home-feature-title">Remember</p>
            <p class="home-feature-desc">Write your own private moments and mix them into your feed.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TRY IT -->
    <div class="home-section home-try">
      <div class="home-try-card">
        <p class="home-try-label">Try it now</p>
        <p class="home-try-code">ART-101</p>
        <p class="home-try-desc">Enter this code to unlock a collection of 30 cards about art, creativity, and making things.</p>
        <button class="btn btn-primary btn-full mt-12" id="welcome-try-demo">
          Enter code
        </button>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="home-footer">
      <p>moments</p>
      <p class="home-footer-sub">the app for those we love</p>
    </div>
  `;

  container.appendChild(div);

  // Navigation
  div.querySelector('#welcome-enter-code').addEventListener('click', () => router.navigate('codes'));
  div.querySelector('#welcome-try-demo')?.addEventListener('click', () => router.navigate('codes'));

  const openBtn = div.querySelector('#welcome-open-card');
  if (openBtn) openBtn.addEventListener('click', () => router.navigate('card'));

  div.querySelector('#feat-code').addEventListener('click', () => router.navigate('codes'));
  div.querySelector('#feat-create').addEventListener('click', () => router.navigate('create'));
  div.querySelector('#feat-journal').addEventListener('click', () => router.navigate('vault'));
}
