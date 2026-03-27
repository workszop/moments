export function MessageEditor(container, giftState, { onNext, onBack }) {
  function render() {
    container.innerHTML = `
      <div class="text-center mb-20">
        <div class="title mb-4">Add moments</div>
        <p class="subtitle">
          Write messages, compliments, inside jokes, or memories
          ${giftState.recipientName ? `for ${giftState.recipientName}` : ''}.
        </p>
      </div>

      <div class="form-panel w-full mb-16">
        <textarea
          class="textarea mb-10"
          id="msg-content"
          placeholder="Write something warm and personal..."
          rows="3"
        ></textarea>
        <div class="flex-row gap-8 flex-wrap">
          <input
            type="text"
            class="input input-compact flex-1"
            id="msg-author"
            placeholder="Author"
            style="min-width:100px"
          >
          <button class="btn btn-primary btn-small" id="msg-add-btn">+ Add</button>
        </div>
      </div>

      ${giftState.messages.length > 0 ? `
        <p class="label mb-10">${giftState.messages.length} moment${giftState.messages.length !== 1 ? 's' : ''} added</p>
        <div class="flex-col gap-10 w-full mb-16" id="msg-list"></div>
      ` : `
        <p class="hint text-center mb-16">Add at least one moment to continue.</p>
      `}

      <div class="flex-row gap-10">
        <button class="btn btn-secondary" id="msg-back-btn">Back</button>
        <button class="btn btn-primary flex-1" id="msg-next-btn" ${giftState.messages.length === 0 ? 'disabled' : ''}>
          Next
        </button>
      </div>
    `;

    const list = container.querySelector('#msg-list');
    if (list) {
      giftState.messages.forEach((msg, i) => {
        const card = document.createElement('div');
        card.className = 'card-flat';
        card.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:10px';
        card.innerHTML = `
          <div style="flex:1">
            <p style="font-size:13px;font-weight:700;line-height:1.5">"${msg.content}"</p>
            ${msg.author ? `<p style="font-size:11px;font-weight:700;color:#aaa;margin-top:4px">${msg.author}</p>` : ''}
          </div>
          <button class="header-btn msg-delete-btn" data-index="${i}" style="font-size:11px;padding:4px 8px">&times;</button>
        `;
        list.appendChild(card);
      });

      list.addEventListener('click', (e) => {
        const btn = e.target.closest('.msg-delete-btn');
        if (btn) {
          giftState.messages.splice(parseInt(btn.dataset.index), 1);
          render();
        }
      });
    }

    const contentEl = container.querySelector('#msg-content');
    const authorEl = container.querySelector('#msg-author');

    container.querySelector('#msg-add-btn').addEventListener('click', () => {
      const content = contentEl.value.trim();
      if (!content) {
        contentEl.classList.add('shake');
        setTimeout(() => contentEl.classList.remove('shake'), 400);
        return;
      }
      giftState.messages.push({ content, author: authorEl.value.trim() });
      render();
    });

    contentEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) container.querySelector('#msg-add-btn').click();
    });

    container.querySelector('#msg-back-btn').addEventListener('click', onBack);
    container.querySelector('#msg-next-btn').addEventListener('click', () => {
      if (giftState.messages.length > 0) onNext();
    });
  }

  render();
}
