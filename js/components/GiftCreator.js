import { store } from '../store.js';
import { router } from '../router.js';
import { RecipientPicker } from './RecipientPicker.js';
import { MessageEditor } from './MessageEditor.js';
import { InviteShare } from './InviteShare.js';
import { CodeReveal } from './CodeReveal.js';

export function GiftCreator(container) {
  const div = document.createElement('div');
  div.className = 'view fade-in';
  div.style.maxWidth = '600px';

  const giftState = {
    step: 1,
    recipientType: null,
    recipientName: '',
    creatorName: '',
    messages: [],
    generatedCode: null
  };

  function renderStepIndicator() {
    const steps = [
      { num: 1, label: 'For whom' },
      { num: 2, label: 'Messages' },
      { num: 3, label: 'Invite' },
      { num: 4, label: 'Done' }
    ];

    return `
      <div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:32px">
        ${steps.map(s => `
          <div style="display:flex;align-items:center;gap:8px">
            <div style="
              width:36px;height:36px;border-radius:12px;
              border:3px solid var(--dark);
              background:${giftState.step >= s.num ? 'var(--purple)' : '#fff'};
              color:${giftState.step >= s.num ? '#fff' : 'var(--dark)'};
              display:flex;align-items:center;justify-content:center;
              font-size:.9rem;font-weight:900;
              box-shadow:2px 2px 0 var(--dark);
            ">${s.num}</div>
            ${s.num < 4 ? '<div style="width:20px;height:3px;background:var(--dark);border-radius:2px"></div>' : ''}
          </div>
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
      for (let i = 0; i < len; i++) {
        s += chars[Math.floor(Math.random() * chars.length)];
      }
      return s;
    }).join('-');
  }

  function finalizeGift() {
    const code = generateCode();
    giftState.generatedCode = code;

    // Save to store
    const codeEntry = {
      code_id: code,
      creator_name: giftState.creatorName || 'someone special',
      recipient_name: giftState.recipientName || giftState.recipientType || 'someone',
      is_active: true
    };

    store.state.accessCodes.push(codeEntry);

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

    // Persist
    store._persist();
    store._notify();
  }

  render();
  container.appendChild(div);
}
