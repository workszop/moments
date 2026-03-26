import { store } from '../store.js';
import { router } from '../router.js';

export function CodeEntry(container) {
  const div = document.createElement('div');
  div.className = 'view text-center fade-in';

  div.innerHTML = `
    <div class="mb-32">
      <h2 class="title-md mb-12">Enter your code</h2>
      <p class="subtitle mb-24">
        Someone special gave you a code &mdash; enter it below to unlock your moments.
      </p>
    </div>

    <div class="w-full" style="max-width:340px">
      <input
        type="text"
        class="input mb-16"
        id="code-input"
        placeholder="e.g. DEMO-LOVE-2026"
        autocomplete="off"
        spellcheck="false"
        style="text-align:center;font-size:20px;letter-spacing:2px;text-transform:uppercase"
      >
      <div id="code-error" style="color:var(--red);font-size:14px;font-weight:700;margin-bottom:16px;display:none"></div>
      <button class="btn-primary w-full" id="code-unlock-btn">
        Unlock moments
      </button>

      <div id="code-success" style="display:none;margin-top:24px" class="pop-in">
        <div class="card-flat text-center" style="background:var(--green);color:var(--dark)">
          <p style="font-size:1.5rem;margin-bottom:8px"></p>
          <p style="font-weight:900;font-size:1.1rem;margin-bottom:4px">Code unlocked!</p>
          <p style="font-weight:700;font-size:.9rem" id="code-success-detail"></p>
        </div>
      </div>
    </div>

    <div style="margin-top:32px">
      <p style="font-size:13px;font-weight:700;color:#aaa;margin-bottom:12px">
        Already have codes?
      </p>
      <button class="btn-secondary btn-small" id="code-manage-btn">
        Manage my codes
      </button>
    </div>
  `;

  container.appendChild(div);

  const input = div.querySelector('#code-input');
  const errorEl = div.querySelector('#code-error');
  const successEl = div.querySelector('#code-success');
  const detailEl = div.querySelector('#code-success-detail');
  const unlockBtn = div.querySelector('#code-unlock-btn');

  function tryUnlock() {
    const value = input.value.trim().toUpperCase();
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (!value) {
      errorEl.textContent = 'Please enter a code';
      errorEl.style.display = 'block';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
      return;
    }

    const code = store.findCode(value);
    if (!code) {
      errorEl.textContent = 'Code not found. Check and try again.';
      errorEl.style.display = 'block';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
      return;
    }

    store.unlockCode(value);
    const msgCount = store.getMessagesForCode(value).length;
    detailEl.textContent = `${msgCount} moment${msgCount !== 1 ? 's' : ''} from ${code.creator_name} for ${code.recipient_name}`;
    successEl.style.display = 'block';
    unlockBtn.style.display = 'none';
    input.disabled = true;

    setTimeout(() => {
      router.navigate('card');
    }, 1800);
  }

  unlockBtn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });

  div.querySelector('#code-manage-btn').addEventListener('click', () => {
    router.navigate('my-codes');
  });
}
