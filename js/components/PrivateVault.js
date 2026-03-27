import { store } from '../store.js';

export function PrivateVault(container) {
  const div = document.createElement('div');
  div.className = 'view view-scroll fade-in';

  function render() {
    const entries = store.getPrivateEntries();

    div.innerHTML = `
      <div class="text-center mb-20">
        <div class="section-label mb-12">remember</div>
        <div class="title mb-4">Private Vault</div>
        <p class="subtitle">What made you smile today?</p>
      </div>

      <div class="form-panel w-full mb-16">
        <textarea
          class="textarea mb-10"
          id="vault-input"
          placeholder="Write a happy thought, a memory, something you're grateful for..."
          rows="3"
        ></textarea>
        <button class="btn btn-primary btn-full" id="vault-save-btn">
          Save moment
        </button>
      </div>

      ${entries.length > 0 ? `
        <div class="w-full">
          <p class="label mb-12">${entries.length} private moment${entries.length !== 1 ? 's' : ''}</p>
          <div class="flex-col gap-10" id="vault-list"></div>
        </div>
      ` : `
        <p class="hint text-center mt-8">
          Your entries will appear here and show up in your card feed.
        </p>
      `}
    `;

    const list = div.querySelector('#vault-list');
    if (list) {
      entries.slice().reverse().forEach(entry => {
        const card = document.createElement('div');
        card.className = 'card-flat';
        card.innerHTML = `
          <p style="font-size:14px;font-weight:700;line-height:1.6">"${entry.content}"</p>
          <p style="font-size:11px;font-weight:700;color:#bbb;margin-top:8px">&mdash; you</p>
        `;
        list.appendChild(card);
      });
    }

    const input = div.querySelector('#vault-input');
    const saveBtn = div.querySelector('#vault-save-btn');

    saveBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
        return;
      }
      store.addPrivateEntry(text);
      window.showToast('Moment saved');
      render();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveBtn.click();
    });
  }

  render();
  container.appendChild(div);
}
