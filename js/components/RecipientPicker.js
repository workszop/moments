export function RecipientPicker(container, giftState, onNext) {
  const types = [
    { id: 'partner', label: 'Partner', color: 'var(--fg)' },
    { id: 'friend', label: 'Friend', color: 'var(--fg)' },
    { id: 'kid', label: 'Kid', color: 'var(--fg)' },
    { id: 'colleague', label: 'Colleague', color: 'var(--fg)' }
  ];

  container.innerHTML = `
    <div class="text-center mb-20">
      <div class="title mb-4">Who is this gift for?</div>
      <p class="subtitle">Choose the type of relationship.</p>
    </div>

    <div class="grid-2 mb-16" id="type-grid"></div>

    <div class="mb-12">
      <p class="label mb-8">Their name</p>
      <input type="text" class="input" id="recipient-name" placeholder="e.g. Sarah" value="${giftState.recipientName}">
    </div>
    <div class="mb-20">
      <p class="label mb-8">Your name</p>
      <input type="text" class="input" id="creator-name" placeholder="e.g. Alex" value="${giftState.creatorName}">
    </div>

    <button class="btn btn-primary btn-full" id="pick-next-btn" disabled>Next</button>
  `;

  const grid = container.querySelector('#type-grid');
  const nextBtn = container.querySelector('#pick-next-btn');
  const recipientInput = container.querySelector('#recipient-name');
  const creatorInput = container.querySelector('#creator-name');

  let selected = giftState.recipientType;

  types.forEach(t => {
    const card = document.createElement('button');
    card.className = 'card';
    card.dataset.type = t.id;
    const isActive = selected === t.id;
    card.style.cssText = `
      cursor:pointer;text-align:center;padding:20px 14px;
      border-width:${isActive ? '2px' : '1px'};
      background:${isActive ? '#f0f0f0' : '#fff'};
    `;
    card.innerHTML = `<p style="font-weight:900;font-size:16px">${t.label}</p>`;
    card.addEventListener('click', () => {
      selected = t.id;
      grid.querySelectorAll('.card').forEach(c => {
        c.style.borderWidth = '1px';
        c.style.background = '#fff';
      });
      card.style.borderWidth = '2px';
      card.style.background = '#f0f0f0';
      nextBtn.disabled = false;
    });
    grid.appendChild(card);
  });

  if (selected) nextBtn.disabled = false;

  nextBtn.addEventListener('click', () => {
    giftState.recipientType = selected;
    giftState.recipientName = recipientInput.value.trim();
    giftState.creatorName = creatorInput.value.trim();
    onNext();
  });
}
