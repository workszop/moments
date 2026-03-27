import { store } from '../store.js';
import { router } from '../router.js';

export function PrivateVault(container) {
  const div = document.createElement('div');
  div.className = 'view view-center fade-in';

  const count = store.getPrivateEntries().length;

  div.innerHTML = `
    <div class="text-center mb-20">
      <div class="section-label mb-12">remember</div>
      <div class="title mb-4">Add a moment</div>
      <p class="subtitle">Write something you want to remember. It will appear as a card in your feed.</p>
    </div>

    <div class="form-panel w-full mb-16">
      <textarea
        class="textarea mb-10"
        id="vault-input"
        placeholder="A happy thought, a memory, something you're grateful for..."
        rows="3"
      ></textarea>
      <button class="btn btn-primary btn-full" id="vault-save-btn">
        Save moment
      </button>
    </div>

    ${count > 0 ? `
      <p class="hint text-center">${count} private moment${count !== 1 ? 's' : ''} in your deck</p>
    ` : `
      <p class="hint text-center">Your moments will show up as cards in your feed.</p>
    `}

    <div class="mt-16">
      <button class="btn btn-secondary btn-small" id="vault-back-btn">Back</button>
    </div>
  `;

  container.appendChild(div);

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
    input.value = '';
    window.showToast('Moment saved');
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveBtn.click();
  });

  div.querySelector('#vault-back-btn').addEventListener('click', () => router.navigate('my-codes'));
}
