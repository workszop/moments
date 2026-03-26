export function InviteShare(container, giftState, { onNext, onBack }) {
  // Generate a simple invite token
  const inviteToken = giftState._inviteToken || ('inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  giftState._inviteToken = inviteToken;

  const baseUrl = window.location.origin + window.location.pathname;
  const inviteLink = `${baseUrl}#contribute/${inviteToken}`;

  container.innerHTML = `
    <div class="text-center mb-24">
      <h2 class="title-md mb-8">Invite friends to contribute</h2>
      <p class="subtitle">
        Share this link with others so they can add their own moments
        ${giftState.recipientName ? `for ${giftState.recipientName}` : ''}.
      </p>
    </div>

    <div class="w-full mb-24" style="background:var(--yellow);border:3px solid var(--dark);border-radius:20px;padding:24px;box-shadow:5px 5px 0 var(--dark)">
      <p style="font-size:13px;font-weight:800;margin-bottom:12px">Share this link</p>
      <div style="display:flex;gap:8px;align-items:center">
        <input
          type="text"
          class="input"
          id="invite-link"
          value="${inviteLink}"
          readonly
          style="font-size:13px;background:#fff;cursor:text"
        >
        <button class="btn-primary btn-small" id="copy-link-btn">Copy</button>
      </div>
      <p id="copy-feedback" style="font-size:12px;font-weight:700;color:var(--dark);margin-top:8px;opacity:0;transition:opacity .2s">
        Copied!
      </p>
    </div>

    ${navigator.share ? `
      <button class="btn-secondary w-full mb-24" id="native-share-btn">
        &#128228; Share via...
      </button>
    ` : ''}

    <div style="background:#fff;border:3px solid var(--dark);border-radius:20px;padding:24px;margin-bottom:24px">
      <p style="font-size:.9rem;font-weight:700;color:#888;line-height:1.6">
        &#128161; <strong>This step is optional.</strong> You can skip it and finalize the gift now.
        Contributors can still be added later using the invite link.
      </p>
    </div>

    <div style="display:flex;gap:12px">
      <button class="btn-secondary" id="invite-back-btn">&#8592; Back</button>
      <button class="btn-primary" id="invite-done-btn" style="flex:1">
        Finalize gift &#127873;
      </button>
    </div>
  `;

  // Copy link
  const copyBtn = container.querySelector('#copy-link-btn');
  const copyFeedback = container.querySelector('#copy-feedback');
  const linkInput = container.querySelector('#invite-link');

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      copyFeedback.style.opacity = '1';
      setTimeout(() => { copyFeedback.style.opacity = '0'; }, 2000);
    }).catch(() => {
      linkInput.select();
      document.execCommand('copy');
      copyFeedback.style.opacity = '1';
      setTimeout(() => { copyFeedback.style.opacity = '0'; }, 2000);
    });
  });

  // Native share
  const shareBtn = container.querySelector('#native-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.share({
        title: `Add moments for ${giftState.recipientName || 'someone special'}`,
        text: `You're invited to contribute a heartfelt message!`,
        url: inviteLink
      }).catch(() => {});
    });
  }

  container.querySelector('#invite-back-btn').addEventListener('click', onBack);
  container.querySelector('#invite-done-btn').addEventListener('click', onNext);
}
