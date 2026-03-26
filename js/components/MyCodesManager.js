import { store } from '../store.js';
import { router } from '../router.js';

export function MyCodesManager(container) {
  const div = document.createElement('div');
  div.className = 'view fade-in';
  div.style.maxWidth = '600px';

  function render() {
    const codes = store.getUnlockedCodes();

    div.innerHTML = `
      <div class="text-center mb-32">
        <h2 class="title-md mb-8">My Codes</h2>
        <p class="subtitle">Manage all your unlocked moment banks.</p>
      </div>

      <div class="w-full mb-24">
        <div style="display:flex;gap:8px">
          <input
            type="text"
            class="input"
            id="add-code-input"
            placeholder="Enter a new code"
            style="text-transform:uppercase;letter-spacing:1px"
          >
          <button class="btn-primary btn-small" id="add-code-btn">Add</button>
        </div>
        <div id="add-code-error" style="color:var(--red);font-size:13px;font-weight:700;margin-top:8px;display:none"></div>
        <div id="add-code-success" style="color:var(--green);font-size:13px;font-weight:700;margin-top:8px;display:none"></div>
      </div>

      ${codes.length > 0 ? `
        <div class="flex-col gap-12 w-full" id="codes-list"></div>
      ` : `
        <p class="subtitle text-center" style="font-size:14px">
          No codes yet. Enter one above or try <strong style="color:var(--purple)">DEMO-LOVE-2026</strong>
        </p>
      `}

      <div style="margin-top:32px">
        <button class="btn-secondary btn-small" id="codes-back-btn">&#8592; Back</button>
      </div>
    `;

    // Render code cards
    const list = div.querySelector('#codes-list');
    if (list) {
      codes.forEach(code => {
        const msgCount = store.getMessagesForCode(code.code_id).length;
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'default';
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <p style="font-weight:900;font-size:1rem;letter-spacing:1px">${code.code_id}</p>
              <p style="font-size:.85rem;font-weight:700;color:#888;margin-top:4px">
                from ${code.creator_name} &middot; ${msgCount} moment${msgCount !== 1 ? 's' : ''}
              </p>
            </div>
            <span class="chip chip-green" style="font-size:11px">active</span>
          </div>
        `;
        list.appendChild(card);
      });
    }

    // Bind add code
    const addInput = div.querySelector('#add-code-input');
    const addBtn = div.querySelector('#add-code-btn');
    const errorEl = div.querySelector('#add-code-error');
    const successEl = div.querySelector('#add-code-success');

    function tryAdd() {
      const val = addInput.value.trim().toUpperCase();
      errorEl.style.display = 'none';
      successEl.style.display = 'none';

      if (!val) return;

      const found = store.findCode(val);
      if (!found) {
        errorEl.textContent = 'Code not found.';
        errorEl.style.display = 'block';
        return;
      }

      if (found.is_active) {
        successEl.textContent = 'This code is already active!';
        successEl.style.display = 'block';
        return;
      }

      store.unlockCode(val);
      addInput.value = '';
      render();
    }

    addBtn.addEventListener('click', tryAdd);
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') tryAdd();
    });

    div.querySelector('#codes-back-btn').addEventListener('click', () => {
      router.navigate('welcome');
    });
  }

  render();
  const unsub = store.subscribe(render);
  container.appendChild(div);

  return () => unsub();
}
