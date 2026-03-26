export function MessageEditor(container, giftState, { onNext, onBack }) {
  const typeOptions = [
    { value: 'sentence', label: 'Message' },
    { value: 'compliment', label: 'Compliment' },
    { value: 'story', label: 'Story / Memory' }
  ];

  function render() {
    container.innerHTML = `
      <div class="text-center mb-24">
        <h2 class="title-md mb-8">Add moments</h2>
        <p class="subtitle">
          Write messages, compliments, inside jokes, or memories
          ${giftState.recipientName ? `for ${giftState.recipientName}` : ''}.
        </p>
      </div>

      <div class="w-full mb-16" style="background:#fff;border:3px solid var(--dark);border-radius:20px;padding:20px">
        <textarea
          class="textarea mb-12"
          id="msg-content"
          placeholder="Write something warm and personal..."
          rows="3"
          style="border:2px solid #e5e5e5"
        ></textarea>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select class="input" id="msg-type" style="flex:1;min-width:140px;padding:10px 14px;font-size:14px">
            ${typeOptions.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
          </select>
          <input
            type="text"
            class="input"
            id="msg-author"
            placeholder="Author (optional)"
            style="flex:1;min-width:120px;padding:10px 14px;font-size:14px"
          >
          <button class="btn-primary btn-small" id="msg-add-btn">+ Add</button>
        </div>
      </div>

      ${giftState.messages.length > 0 ? `
        <p style="font-size:13px;font-weight:800;color:#aaa;margin-bottom:12px">
          ${giftState.messages.length} moment${giftState.messages.length !== 1 ? 's' : ''} added
        </p>
        <div class="flex-col gap-12 w-full mb-24" id="msg-list"></div>
      ` : `
        <p class="subtitle text-center" style="font-size:14px;margin-bottom:24px">
          Add at least one moment to continue.
        </p>
      `}

      <div style="display:flex;gap:12px">
        <button class="btn-secondary" id="msg-back-btn">&#8592; Back</button>
        <button class="btn-primary" id="msg-next-btn" style="flex:1" ${giftState.messages.length === 0 ? 'disabled' : ''}>
          Next &rarr;
        </button>
      </div>
    `;

    // Render message list
    const list = container.querySelector('#msg-list');
    if (list) {
      giftState.messages.forEach((msg, i) => {
        const card = document.createElement('div');
        card.className = 'card-flat';
        card.style.cssText = 'border:2.5px solid var(--dark);border-radius:14px;padding:16px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px';
        card.innerHTML = `
          <div style="flex:1">
            <p style="font-size:.9rem;font-weight:700;line-height:1.5">"${msg.content}"</p>
            <p style="font-size:.75rem;font-weight:700;color:#aaa;margin-top:6px">
              ${msg.author ? msg.author + ' &middot; ' : ''}${msg.type}
            </p>
          </div>
          <button style="
            background:none;border:none;cursor:pointer;
            font-size:1.1rem;color:#ccc;padding:4px;
            transition:color .15s;
          " class="msg-delete-btn" data-index="${i}" title="Remove">&times;</button>
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

    // Bind add
    const contentEl = container.querySelector('#msg-content');
    const typeEl = container.querySelector('#msg-type');
    const authorEl = container.querySelector('#msg-author');
    const addBtn = container.querySelector('#msg-add-btn');

    addBtn.addEventListener('click', () => {
      const content = contentEl.value.trim();
      if (!content) {
        contentEl.classList.add('shake');
        setTimeout(() => contentEl.classList.remove('shake'), 400);
        return;
      }
      giftState.messages.push({
        content,
        type: typeEl.value,
        author: authorEl.value.trim()
      });
      render();
    });

    contentEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        addBtn.click();
      }
    });

    container.querySelector('#msg-back-btn').addEventListener('click', onBack);
    container.querySelector('#msg-next-btn').addEventListener('click', () => {
      if (giftState.messages.length > 0) onNext();
    });
  }

  render();
}
