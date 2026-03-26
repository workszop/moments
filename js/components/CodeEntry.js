import { store } from '../store.js';
import { router } from '../router.js';

export function CodeEntry(container) {
  const div = document.createElement('div');
  div.className = 'view view-center fade-in';

  div.innerHTML = `
    <div class="text-center mb-24">
      <div class="section-label mb-12">unlock</div>
      <div class="title mb-4">Enter your code</div>
      <p class="subtitle">Someone special gave you a code &mdash;<br>enter it below to unlock your moments.</p>
    </div>

    <div class="w-full mb-16">
      <input
        type="text"
        class="input input-code mb-8"
        id="code-input"
        placeholder="e.g. DEMO-LOVE-2026"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        maxlength="20"
      >
      <div class="error-text mb-8" id="code-error" style="text-align:center"></div>
      <button class="btn btn-primary btn-full" id="code-unlock-btn">
        Unlock moments
      </button>
    </div>

    <div id="code-success" style="display:none" class="pop-in w-full mb-16">
      <div class="success-box">
        <div class="success-box-title">Code unlocked!</div>
        <div class="success-box-sub" id="code-success-detail"></div>
      </div>
    </div>

    <div class="text-center mt-16">
      <p class="hint mb-8">Already have codes?</p>
      <button class="btn btn-secondary btn-small" id="code-manage-btn">Manage my codes</button>
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
    errorEl.textContent = '';
    successEl.style.display = 'none';

    if (!value) {
      errorEl.textContent = 'Please enter a code';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
      return;
    }

    const code = store.findCode(value);
    if (!code) {
      errorEl.textContent = 'Code not found. Check and try again.';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
      return;
    }

    store.unlockCode(value);
    const msgCount = store.getMessagesForCode(value).length;
    detailEl.textContent = `${msgCount} moment${msgCount !== 1 ? 's' : ''} from ${code.creator_name}`;
    successEl.style.display = 'block';
    unlockBtn.style.display = 'none';
    input.disabled = true;
    window.showToast('Code unlocked!');

    setTimeout(() => router.navigate('card'), 1800);
  }

  unlockBtn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
  div.querySelector('#code-manage-btn').addEventListener('click', () => router.navigate('my-codes'));
}
