import { router } from '../router.js';
import { store } from '../store.js';

export function WelcomeScreen(container) {
  const div = document.createElement('div');
  div.className = 'view text-center fade-in';

  const hasCodes = store.hasAnyCodes();

  div.innerHTML = `
    <div class="mb-32">
      <div class="section-label mb-16">&#10024; pick-me-up</div>
      <h1 class="title-lg mb-12">
        a little <span class="highlight">moment</span><br>
        just for you
      </h1>
      <p class="subtitle mb-32">
        Open a card and receive a dose of warmth &mdash; a message, a memory, a compliment from someone who cares.
      </p>
    </div>

    <div class="flex-col gap-12 w-full" style="max-width:340px">
      <button class="btn-primary w-full" id="welcome-enter-code">
        &#128274; I have a code
      </button>
      <button class="btn-secondary w-full" id="welcome-create-gift">
        &#127873; Create a gift
      </button>
      <button class="btn-secondary w-full" id="welcome-journal">
        &#128216; Start my journal
      </button>
    </div>

    ${hasCodes ? `
      <div style="margin-top:24px">
        <button class="btn-primary" id="welcome-open-card">
          &#9825; Open today's card
        </button>
      </div>
    ` : `
      <p style="margin-top:32px;font-size:13px;font-weight:700;color:#aaa">
        Try the demo code: <strong style="color:var(--purple)">DEMO-LOVE-2026</strong>
      </p>
    `}
  `;

  container.appendChild(div);

  div.querySelector('#welcome-enter-code').addEventListener('click', () => {
    router.navigate('codes');
  });
  div.querySelector('#welcome-create-gift').addEventListener('click', () => {
    router.navigate('create');
  });
  div.querySelector('#welcome-journal').addEventListener('click', () => {
    router.navigate('vault');
  });

  const openBtn = div.querySelector('#welcome-open-card');
  if (openBtn) {
    openBtn.addEventListener('click', () => router.navigate('card'));
  }
}
