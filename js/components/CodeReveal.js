import { router } from '../router.js';

export function CodeReveal(container, giftState) {
  const code = giftState.generatedCode;

  container.innerHTML = `
    <div class="text-center">
      <div class="title mb-4 pop-in">Gift created!</div>
      <p class="subtitle mb-20">
        Give this code to ${giftState.recipientName || 'your person'} so they can unlock their moments.
      </p>

      <div class="code-card mb-20 pop-in">
        <div class="code-card-label">Access code</div>
        <div class="code-card-code" id="reveal-code">${code}</div>
        <button class="btn btn-primary btn-small" id="copy-code-btn">Copy code</button>
        <p id="copy-code-feedback" class="hint mt-8" style="opacity:0;transition:opacity .2s;color:rgba(0,0,0,.5)">Copied!</p>
      </div>

      <div class="flex-row gap-8 flex-wrap flex-center mb-20">
        <span class="chip">${giftState.messages.length} moment${giftState.messages.length !== 1 ? 's' : ''}</span>
        <span class="chip chip-purple">for ${giftState.recipientName || giftState.recipientType || 'someone'}</span>
        ${giftState.creatorName ? `<span class="chip">from ${giftState.creatorName}</span>` : ''}
      </div>

      ${navigator.share ? `
        <button class="btn btn-secondary btn-full mb-12" id="share-code-btn">Share code</button>
      ` : ''}

      <button class="btn btn-primary btn-full mb-10" id="reveal-open-btn">Open the moments</button>
      <button class="btn btn-secondary btn-full" id="reveal-home-btn">Back to home</button>
    </div>
  `;

  launchConfetti();

  const copyBtn = container.querySelector('#copy-code-btn');
  const feedback = container.querySelector('#copy-code-feedback');

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(code).then(() => {
      feedback.style.opacity = '1';
      window.showToast('Code copied!');
      setTimeout(() => { feedback.style.opacity = '0'; }, 2000);
    }).catch(() => {
      const range = document.createRange();
      range.selectNode(container.querySelector('#reveal-code'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      feedback.style.opacity = '1';
      setTimeout(() => { feedback.style.opacity = '0'; }, 2000);
    });
  });

  const shareBtn = container.querySelector('#share-code-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.share({
        title: 'Your moments code',
        text: `Here's your access code for moments: ${code}\nEnter it in the app to unlock your messages!`
      }).catch(() => {});
    });
  }

  container.querySelector('#reveal-open-btn').addEventListener('click', () => router.navigate('card'));
  container.querySelector('#reveal-home-btn').addEventListener('click', () => router.navigate('welcome'));
}

function launchConfetti() {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF'];
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(el);

  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    p.style.cssText = `
      position:absolute;top:-20px;left:${Math.random() * 100}%;
      width:${size}px;height:${size * 0.6}px;background:${color};
      border-radius:2px;transform:rotate(${Math.random() * 360}deg);
      animation:confettiFall ${1.5 + Math.random()}s ease-out ${Math.random() * 600}ms forwards;
    `;
    el.appendChild(p);
  }

  setTimeout(() => el.remove(), 3000);
}
