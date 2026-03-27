import { store } from '../store.js';
import { router } from '../router.js';

export function MyCodesManager(container) {
  const div = document.createElement('div');
  div.className = 'view view-scroll fade-in';

  function render() {
    const allCodes = store.getAllCodes();
    const knownCodes = allCodes.filter(c => c.is_active || c._unlocked);
    const privateCount = store.getPrivateEntries().length;
    const privateActive = store.isPrivateVaultActive();

    div.innerHTML = `
      <div class="text-center mb-20">
        <div class="title mb-4">My Codes</div>
        <p class="subtitle">Activate or deactivate your moment collections.</p>
      </div>

      <div class="form-panel w-full mb-16">
        <div class="flex-row gap-8">
          <input
            type="text"
            class="input input-code flex-1"
            id="add-code-input"
            placeholder="Code"
            maxlength="20"
          >
          <button class="btn btn-primary btn-small" id="add-code-btn">Add</button>
        </div>
        <div class="error-text mt-8" id="add-code-error"></div>
      </div>

      <div class="flex-col gap-10 w-full" id="codes-list">
        <!-- Private vault as a toggleable collection -->
        <div class="card">
          <div class="flex-between">
            <div>
              <p style="font-weight:900;font-size:14px;letter-spacing:1px">REMEMBER</p>
              <p style="font-size:12px;font-weight:700;color:#888;margin-top:4px">
                your private moments &middot; ${privateCount} moment${privateCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div class="flex-row gap-8">
              <button class="header-btn" id="vault-add-btn">+ add</button>
              <button class="header-btn ${privateActive ? 'header-btn-active' : ''}" id="toggle-vault-btn">
                ${privateActive ? 'on' : 'off'}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${knownCodes.length === 0 && privateCount === 0 ? `
        <p class="hint text-center mt-16">
          No codes yet. Enter one above or try <strong style="color:#000">ART-101</strong>
        </p>
      ` : ''}

      <div class="mt-16">
        <button class="btn btn-secondary btn-small" id="codes-back-btn">Back</button>
      </div>
    `;

    const list = div.querySelector('#codes-list');

    // Render code collections
    knownCodes.forEach(code => {
      const msgCount = store.getMessagesForCode(code.code_id).length;
      const isActive = code.is_active;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="flex-between">
          <div>
            <p style="font-weight:900;font-size:14px;letter-spacing:1px">${code.code_id}</p>
            <p style="font-size:12px;font-weight:700;color:#888;margin-top:4px">
              from ${code.creator_name} &middot; ${msgCount} moment${msgCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button class="header-btn ${isActive ? 'header-btn-active' : ''} toggle-code-btn" data-code="${code.code_id}">
            ${isActive ? 'on' : 'off'}
          </button>
        </div>
      `;
      list.appendChild(card);
    });

    // Toggle code listeners
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-code-btn');
      if (btn) {
        store.toggleCode(btn.dataset.code);
        render();
      }
    });

    // Vault toggle
    div.querySelector('#toggle-vault-btn').addEventListener('click', () => {
      store.togglePrivateVault();
      render();
    });

    // Vault add button
    div.querySelector('#vault-add-btn').addEventListener('click', () => {
      router.navigate('vault');
    });

    // Add code
    const addInput = div.querySelector('#add-code-input');
    const addBtn = div.querySelector('#add-code-btn');
    const errorEl = div.querySelector('#add-code-error');

    function tryAdd() {
      const val = addInput.value.trim().toUpperCase();
      errorEl.textContent = '';
      if (!val) return;

      const found = store.findCode(val);
      if (!found) { errorEl.textContent = 'Code not found.'; return; }
      if (found.is_active) { window.showToast('Code already active'); return; }

      store.unlockCode(val);
      addInput.value = '';
      window.showToast('Code unlocked!');
      render();
    }

    addBtn.addEventListener('click', tryAdd);
    addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryAdd(); });
    div.querySelector('#codes-back-btn').addEventListener('click', () => router.navigate('welcome'));
  }

  render();
  const unsub = store.subscribe(render);
  container.appendChild(div);
  return () => unsub();
}
