import { router } from '../router.js';
import { store } from '../store.js';

export function WelcomeScreen(container) {
  const div = document.createElement('div');
  div.className = 'view view-center fade-in';

  const hasCodes = store.hasAnyCodes();

  div.innerHTML = `
    <div class="hero-card mb-16">
      <div class="hero-card-label">pick-me-up</div>
      <div class="hero-card-title">moments</div>
      <div class="hero-card-sub">Open a card and receive a dose of warmth &mdash; a message, a memory, a compliment from someone who cares.</div>
    </div>

    <div class="flex-col gap-10 w-full">
      ${hasCodes ? `
        <button class="btn btn-primary btn-full" id="welcome-open-card">
          Open today's card
        </button>
      ` : ''}
      <button class="btn ${hasCodes ? 'btn-secondary' : 'btn-primary'} btn-full" id="welcome-enter-code">
        I have a code
      </button>
      <button class="btn btn-secondary btn-full" id="welcome-create-gift">
        Create a gift
      </button>
      <button class="btn btn-secondary btn-full" id="welcome-journal">
        Start my journal
      </button>
    </div>

    ${!hasCodes ? `
      <p class="hint mt-16 text-center">
        Try the demo code: <strong style="color:#000">ART-101</strong>
      </p>
    ` : ''}
  `;

  container.appendChild(div);

  div.querySelector('#welcome-enter-code').addEventListener('click', () => router.navigate('codes'));
  div.querySelector('#welcome-create-gift').addEventListener('click', () => router.navigate('create'));
  div.querySelector('#welcome-journal').addEventListener('click', () => router.navigate('vault'));

  const openBtn = div.querySelector('#welcome-open-card');
  if (openBtn) openBtn.addEventListener('click', () => router.navigate('card'));
}
