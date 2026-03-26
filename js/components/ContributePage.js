import { store } from '../store.js';
import { router } from '../router.js';

export function ContributePage(container, params) {
  const div = document.createElement('div');
  div.className = 'view text-center fade-in';
  div.style.maxWidth = '500px';

  // Find gift by invite token or code
  const inviteId = params.id || '';

  const typeOptions = [
    { value: 'sentence', label: 'Message' },
    { value: 'compliment', label: 'Compliment' },
    { value: 'story', label: 'Story / Memory' }
  ];

  div.innerHTML = `
    <div class="mb-24">
      <div class="section-label mb-16">contribute</div>
      <h2 class="title-md mb-8">Add a moment</h2>
      <p class="subtitle mb-24">
        Someone invited you to add a heartfelt message. Write something warm &mdash; it'll mean the world.
      </p>
    </div>

    <div class="w-full mb-16">
      <label style="font-size:14px;font-weight:800;display:block;margin-bottom:8px;text-align:left">Access code</label>
      <input
        type="text"
        class="input mb-16"
        id="contrib-code"
        placeholder="Enter the gift code"
        style="text-transform:uppercase;letter-spacing:1px"
      >
    </div>

    <div class="w-full mb-16">
      <textarea
        class="textarea mb-12"
        id="contrib-content"
        placeholder="Write a message, compliment, memory, or inside joke..."
        rows="4"
      ></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <select class="input" id="contrib-type" style="flex:1;min-width:130px;padding:10px 14px;font-size:14px">
          ${typeOptions.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
        </select>
        <input
          type="text"
          class="input"
          id="contrib-author"
          placeholder="Your name (optional)"
          style="flex:1;min-width:120px;padding:10px 14px;font-size:14px"
        >
      </div>
    </div>

    <button class="btn-primary w-full mb-16" id="contrib-submit-btn">
      Send moment
    </button>

    <div id="contrib-error" style="color:var(--red);font-size:14px;font-weight:700;display:none"></div>
    <div id="contrib-success" style="display:none" class="pop-in">
      <div class="card-flat text-center" style="background:var(--green);border:3px solid var(--dark);border-radius:20px;padding:24px">
        <p style="font-size:1.1rem;font-weight:900;margin-bottom:8px"></p>
        <p style="font-weight:900;font-size:1.1rem;margin-bottom:4px">Moment sent!</p>
        <p style="font-weight:700;font-size:.85rem;color:rgba(0,0,0,.6)">
          Your message has been added. They're going to love it.
        </p>
      </div>
    </div>

    <div style="margin-top:24px">
      <button class="btn-secondary btn-small" id="contrib-home-btn">Go to moments app</button>
    </div>
  `;

  container.appendChild(div);

  const codeInput = div.querySelector('#contrib-code');
  const contentInput = div.querySelector('#contrib-content');
  const typeSelect = div.querySelector('#contrib-type');
  const authorInput = div.querySelector('#contrib-author');
  const submitBtn = div.querySelector('#contrib-submit-btn');
  const errorEl = div.querySelector('#contrib-error');
  const successEl = div.querySelector('#contrib-success');

  submitBtn.addEventListener('click', () => {
    const codeVal = codeInput.value.trim().toUpperCase();
    const content = contentInput.value.trim();

    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (!codeVal) {
      errorEl.textContent = 'Please enter the gift code.';
      errorEl.style.display = 'block';
      return;
    }
    if (!content) {
      errorEl.textContent = 'Please write a message.';
      errorEl.style.display = 'block';
      contentInput.classList.add('shake');
      setTimeout(() => contentInput.classList.remove('shake'), 400);
      return;
    }

    const code = store.findCode(codeVal);
    if (!code) {
      errorEl.textContent = 'Code not found. Please check and try again.';
      errorEl.style.display = 'block';
      return;
    }

    // Add message to this code's bank
    store.state.messages.push({
      message_id: 'contrib_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      code_id: codeVal,
      author: authorInput.value.trim() || 'anonymous',
      content,
      type: typeSelect.value
    });
    store._persist();
    store._notify();

    // Show success, hide form
    submitBtn.style.display = 'none';
    successEl.style.display = 'block';
    contentInput.value = '';
    contentInput.disabled = true;
    codeInput.disabled = true;

    // Allow another contribution after a moment
    setTimeout(() => {
      submitBtn.style.display = '';
      submitBtn.textContent = 'Send another moment';
      contentInput.disabled = false;
      contentInput.focus();
    }, 2500);
  });

  div.querySelector('#contrib-home-btn').addEventListener('click', () => {
    router.navigate('welcome');
  });
}
