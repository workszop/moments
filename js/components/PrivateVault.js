import { store } from '../store.js';

export function PrivateVault(container) {
  const div = document.createElement('div');
  div.className = 'view fade-in';
  div.style.maxWidth = '600px';

  function render() {
    const entries = store.getPrivateEntries();

    div.innerHTML = `
      <div class="text-center mb-32">
        <div class="section-label mb-16">my journal</div>
        <h2 class="title-md mb-8">Private Vault</h2>
        <p class="subtitle">What made you smile today?</p>
      </div>

      <div class="w-full mb-24">
        <textarea
          class="textarea mb-12"
          id="vault-input"
          placeholder="Write a happy thought, a memory, something you're grateful for..."
          rows="3"
        ></textarea>
        <button class="btn-primary w-full" id="vault-save-btn">
          Save moment
        </button>
      </div>

      ${entries.length > 0 ? `
        <div class="w-full">
          <p style="font-size:13px;font-weight:800;color:#aaa;margin-bottom:16px">
            ${entries.length} private moment${entries.length !== 1 ? 's' : ''}
          </p>
          <div class="flex-col gap-12" id="vault-list"></div>
        </div>
      ` : `
        <p class="subtitle text-center" style="font-size:14px;margin-top:16px">
          Your entries will appear here and show up in your card feed.
        </p>
      `}
    `;

    const list = div.querySelector('#vault-list');
    if (list) {
      entries.slice().reverse().forEach(entry => {
        const card = document.createElement('div');
        card.className = 'card-flat';
        card.style.cssText = 'background:#faf5ff;border:2.5px solid var(--dark);border-radius:16px;padding:20px';
        card.innerHTML = `
          <p style="font-size:.95rem;font-weight:700;line-height:1.6;color:var(--dark)">
            "${entry.content}"
          </p>
          <p style="font-size:.75rem;font-weight:700;color:#bbb;margin-top:10px">
            &mdash; you
          </p>
        `;
        list.appendChild(card);
      });
    }

    // Bind save
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
      render();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        saveBtn.click();
      }
    });
  }

  render();
  container.appendChild(div);
}
