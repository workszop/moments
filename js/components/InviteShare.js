export function InviteShare(container, giftState, { onNext, onBack }) {
  const inviteToken = giftState._inviteToken || ('inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  giftState._inviteToken = inviteToken;

  const baseUrl = window.location.origin + window.location.pathname;
  const inviteLink = `${baseUrl}#contribute/${inviteToken}`;

  container.innerHTML = `
    <div class="text-center mb-20">
      <div class="title mb-4">Invite friends to contribute</div>
      <p class="subtitle">
        Share this link with others so they can add their own moments
        ${giftState.recipientName ? `for ${giftState.recipientName}` : ''}.
      </p>
    </div>

    <div class="highlight-box w-full mb-16">
      <p class="label mb-10">Share this link</p>
      <div class="flex-row gap-8">
        <input
          type="text"
          class="input flex-1"
          id="invite-link"
          value="${inviteLink}"
          readonly
          style="font-size:12px;background:#fff;cursor:text"
        >
        <button class="btn btn-primary btn-small" id="copy-link-btn">Copy</button>
      </div>
      <p id="copy-feedback" class="hint mt-8" style="opacity:0;transition:opacity .2s">Copied!</p>
    </div>

    ${navigator.share ? `
      <button class="btn btn-secondary btn-full mb-16" id="native-share-btn">
        Share via...
      </button>
    ` : ''}

    <div class="info-box w-full mb-16">
      <p><strong>This step is optional.</strong> You can skip it and finalize the gift now.
      Contributors can still be added later using the invite link.</p>
    </div>

    <div class="flex-row gap-10">
      <button class="btn btn-secondary" id="invite-back-btn">Back</button>
      <button class="btn btn-primary flex-1" id="invite-done-btn">Finalize gift</button>
    </div>
  `;

  const copyBtn = container.querySelector('#copy-link-btn');
  const copyFeedback = container.querySelector('#copy-feedback');
  const linkInput = container.querySelector('#invite-link');

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      copyFeedback.style.opacity = '1';
      window.showToast('Link copied!');
      setTimeout(() => { copyFeedback.style.opacity = '0'; }, 2000);
    }).catch(() => {
      linkInput.select();
      document.execCommand('copy');
      copyFeedback.style.opacity = '1';
      setTimeout(() => { copyFeedback.style.opacity = '0'; }, 2000);
    });
  });

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
