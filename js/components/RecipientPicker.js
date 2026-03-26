export function RecipientPicker(container, giftState, onNext) {
  const types = [
    { id: 'partner', icon: '&#10084;&#65039;', label: 'Partner', color: 'var(--red)' },
    { id: 'friend', icon: '&#129309;', label: 'Friend', color: 'var(--blue)' },
    { id: 'kid', icon: '&#11088;', label: 'Kid', color: 'var(--yellow)' },
    { id: 'colleague', icon: '&#128188;', label: 'Colleague', color: 'var(--green)' }
  ];

  container.innerHTML = `
    <div class="text-center mb-24">
      <h2 class="title-md mb-8">Who is this gift for?</h2>
      <p class="subtitle">Choose the type of relationship.</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px" id="type-grid"></div>

    <div class="mb-16">
      <label style="font-size:14px;font-weight:800;display:block;margin-bottom:8px">Their name</label>
      <input type="text" class="input" id="recipient-name" placeholder="e.g. Sarah" value="${giftState.recipientName}">
    </div>
    <div class="mb-24">
      <label style="font-size:14px;font-weight:800;display:block;margin-bottom:8px">Your name</label>
      <input type="text" class="input" id="creator-name" placeholder="e.g. Alex" value="${giftState.creatorName}">
    </div>

    <button class="btn-primary w-full" id="pick-next-btn" disabled>Next &rarr;</button>
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
    card.style.cssText = `
      cursor:pointer;text-align:center;padding:24px 16px;
      border:3px solid ${selected === t.id ? t.color : 'var(--dark)'};
      background:${selected === t.id ? t.color + '15' : '#fff'};
    `;
    card.innerHTML = `
      <p style="font-size:2rem;margin-bottom:8px">${t.icon}</p>
      <p style="font-weight:900;font-size:.95rem">${t.label}</p>
    `;
    card.addEventListener('click', () => {
      selected = t.id;
      grid.querySelectorAll('.card').forEach(c => {
        c.style.border = '3px solid var(--dark)';
        c.style.background = '#fff';
      });
      card.style.border = `3px solid ${t.color}`;
      card.style.background = t.color + '15';
      checkReady();
    });
    grid.appendChild(card);
  });

  function checkReady() {
    nextBtn.disabled = !selected;
  }

  if (selected) checkReady();

  nextBtn.addEventListener('click', () => {
    giftState.recipientType = selected;
    giftState.recipientName = recipientInput.value.trim();
    giftState.creatorName = creatorInput.value.trim();
    onNext();
  });
}
