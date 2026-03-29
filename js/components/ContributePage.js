import { store } from '../store.js';
import { router } from '../router.js';

export function ContributePage(container) {
  const div = document.createElement('div');
  div.className = 'view view-scroll fade-in';

  div.innerHTML = `
    <div class="text-center mb-20">
      <div class="section-label mb-12">contribute</div>
      <div class="title mb-4">Add a moment</div>
      <p class="subtitle">Someone invited you to add a heartfelt message. Write something warm.</p>
    </div>

    <div class="w-full mb-12">
      <p class="label mb-8">Access code</p>
      <input
        type="text"
        class="input input-code mb-12"
        id="contrib-code"
        placeholder="Gift code"
        maxlength="20"
      >
    </div>

    <div class="form-panel w-full mb-16">
      <textarea
        class="textarea mb-10"
        id="contrib-content"
        placeholder="Write a message, compliment, memory, or inside joke..."
        rows="4"
      ></textarea>
      <div class="flex-row gap-8">
        <input
          type="text"
          class="input input-compact flex-1"
          id="contrib-author"
          placeholder="Your name"
          style="min-width:100px"
        >
      </div>
    </div>

    <button class="btn btn-primary btn-full mb-12" id="contrib-submit-btn">Send moment</button>

    <div class="error-text text-center mb-8" id="contrib-error"></div>

    <div id="contrib-success" class="hidden pop-in w-full mb-16">
      <div class="success-box">
        <div class="success-box-title">Moment sent!</div>
        <div class="success-box-sub">Your message has been added. They're going to love it.</div>
      </div>
    </div>

    <div class="mt-12 text-center">
      <button class="btn btn-secondary btn-small" id="contrib-home-btn">Go to moments app</button>
    </div>
  `;

  container.appendChild(div);

  const codeInput = div.querySelector('#contrib-code');
  const contentInput = div.querySelector('#contrib-content');
  const authorInput = div.querySelector('#contrib-author');
  const submitBtn = div.querySelector('#contrib-submit-btn');
  const errorEl = div.querySelector('#contrib-error');
  const successEl = div.querySelector('#contrib-success');

  submitBtn.addEventListener('click', async () => {
    const codeVal = codeInput.value.trim().toUpperCase();
    const content = contentInput.value.trim();
    errorEl.textContent = '';
    successEl.classList.add('hidden');

    if (!codeVal) { errorEl.textContent = 'Please enter the gift code.'; return; }
    if (!content) {
      errorEl.textContent = 'Please write a message.';
      contentInput.classList.add('shake');
      setTimeout(() => contentInput.classList.remove('shake'), 400);
      return;
    }

    // Check locally first, then try cloud
    let code = store.findCode(codeVal);
    if (!code) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Looking up code...';
      code = await store.fetchAndUnlockCode(codeVal);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send moment';
    }
    if (!code) { errorEl.textContent = 'Code not found. Please check and try again.'; return; }

    const message = {
      message_id: crypto.randomUUID(),
      code_id: codeVal,
      author: authorInput.value.trim() || 'anonymous',
      content
    };

    await store.addContribution(codeVal, message);

    submitBtn.classList.add('hidden');
    successEl.classList.remove('hidden');
    contentInput.value = '';
    contentInput.disabled = true;
    codeInput.disabled = true;
    window.showToast('Moment sent!');

    setTimeout(() => {
      submitBtn.classList.remove('hidden');
      submitBtn.textContent = 'Send another moment';
      contentInput.disabled = false;
      contentInput.focus();
    }, 2500);
  });

  div.querySelector('#contrib-home-btn').addEventListener('click', () => router.navigate('welcome'));
}
