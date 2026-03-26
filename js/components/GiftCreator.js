import { store } from '../store.js';
import { router } from '../router.js';
import { RecipientPicker } from './RecipientPicker.js';
import { MessageEditor } from './MessageEditor.js';
import { InviteShare } from './InviteShare.js';
import { CodeReveal } from './CodeReveal.js';

export function GiftCreator(container) {
  const div = document.createElement('div');
  div.className = 'view view-scroll fade-in';

  const giftState = {
    step: 1,
    recipientType: null,
    recipientName: '',
    creatorName: '',
    messages: [],
    generatedCode: null
  };

  function renderStepIndicator() {
    const steps = [1, 2, 3, 4];
    return `
      <div class="steps-bar">
        ${steps.map((s, i) => `
          <div class="step-dot ${giftState.step >= s ? 'step-dot-active' : 'step-dot-inactive'}">${s}</div>
          ${i < 3 ? '<div class="step-line"></div>' : ''}
        `).join('')}
      </div>
    `;
  }

  function render() {
    div.innerHTML = renderStepIndicator();

    const content = document.createElement('div');
    content.className = 'w-full';
    div.appendChild(content);

    switch (giftState.step) {
      case 1:
        RecipientPicker(content, giftState, () => { giftState.step = 2; render(); });
        break;
      case 2:
        MessageEditor(content, giftState, {
          onNext: () => { giftState.step = 3; render(); },
          onBack: () => { giftState.step = 1; render(); }
        });
        break;
      case 3:
        InviteShare(content, giftState, {
          onNext: () => { finalizeGift(); giftState.step = 4; render(); },
          onBack: () => { giftState.step = 2; render(); }
        });
        break;
      case 4:
        CodeReveal(content, giftState);
        break;
    }
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const parts = [3, 4, 3];
    return parts.map(len => {
      let s = '';
      for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    }).join('-');
  }

  function finalizeGift() {
    const code = generateCode();
    giftState.generatedCode = code;

    store.state.accessCodes.push({
      code_id: code,
      creator_name: giftState.creatorName || 'someone special',
      recipient_name: giftState.recipientName || giftState.recipientType || 'someone',
      is_active: true
    });

    giftState.messages.forEach((msg, i) => {
      store.state.messages.push({
        message_id: 'gift_' + Date.now() + '_' + i,
        code_id: code,
        author: msg.author || giftState.creatorName || 'anonymous',
        content: msg.content,
        type: msg.type || 'sentence'
      });
    });

    store.state.createdGifts.push({
      code,
      recipientType: giftState.recipientType,
      recipientName: giftState.recipientName,
      createdAt: new Date().toISOString(),
      messageCount: giftState.messages.length
    });

    store._persist();
    store._notify();
  }

  render();
  container.appendChild(div);
}
