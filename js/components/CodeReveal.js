import { router } from '../router.js';

export function CodeReveal(container, giftState) {
  const code = giftState.generatedCode;

  container.innerHTML = `
    <div class="text-center">
      <div style="font-size:3rem;margin-bottom:16px" class="pop-in">&#127881;</div>
      <h2 class="title-md mb-8 pop-in">Gift created!</h2>
      <p class="subtitle mb-24">
        Give this code to ${giftState.recipientName || 'your person'} so they can unlock their moments.
      </p>

      <div style="
        background:var(--yellow);
        border:3px solid var(--dark);
        border-radius:28px;
        padding:32px 24px;
        box-shadow:8px 8px 0 var(--dark);
        margin-bottom:32px;
        position:relative;
        overflow:hidden;
      " class="pop-in">
        <p style="font-size:13px;font-weight:800;margin-bottom:12px;color:rgba(0,0,0,.5)">Access code</p>
        <p style="font-size:clamp(1.6rem,5vw,2.2rem);font-weight:900;letter-spacing:4px;font-family:monospace" id="reveal-code">
          ${code}
        </p>
        <button class="btn-primary btn-small" id="copy-code-btn" style="margin-top:16px">
          Copy code
        </button>
        <p id="copy-code-feedback" style="font-size:12px;font-weight:700;margin-top:8px;opacity:0;transition:opacity .2s">
          Copied!
        </p>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:24px">
        <span class="chip">${giftState.messages.length} moment${giftState.messages.length !== 1 ? 's' : ''}</span>
        <span class="chip chip-purple">for ${giftState.recipientName || giftState.recipientType || 'someone'}</span>
        ${giftState.creatorName ? `<span class="chip">from ${giftState.creatorName}</span>` : ''}
      </div>

      ${navigator.share ? `
        <button class="btn-secondary w-full mb-16" id="share-code-btn">
          &#128228; Share code
        </button>
      ` : ''}

      <button class="btn-primary w-full mb-12" id="reveal-open-btn">
        &#9825; Open the moments
      </button>
      <button class="btn-secondary w-full" id="reveal-home-btn">
        Back to home
      </button>
    </div>
  `;

  // Confetti effect
  launchConfetti(container);

  // Copy code
  const copyBtn = container.querySelector('#copy-code-btn');
  const feedback = container.querySelector('#copy-code-feedback');

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(code).then(() => {
      feedback.style.opacity = '1';
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

  // Native share
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

function launchConfetti(container) {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF'];
  const confettiContainer = document.createElement('div');
  confettiContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 600;
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;

    piece.style.cssText = `
      position:absolute;
      top:-20px;left:${left}%;
      width:${size}px;height:${size * 0.6}px;
      background:${color};
      border-radius:2px;
      transform:rotate(${rotation}deg);
      animation:confettiFall ${1.5 + Math.random()}s ease-out ${delay}ms forwards;
    `;
    confettiContainer.appendChild(piece);
  }

  // Add keyframes if not present
  if (!document.querySelector('#confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => confettiContainer.remove(), 3000);
}
