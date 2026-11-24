const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  nav.classList.toggle('is-open', !open);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menu');
  nav.classList.remove('is-open');
  if (window.matchMedia('(max-width: 760px)').matches) menuButton?.focus();
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    nav?.classList.remove('is-open');
    menuButton.focus();
  }
});

const personalizedContact = document.querySelector('.personalized-whatsapp');
if (personalizedContact) {
  const number = (personalizedContact.dataset.whatsappNumber || '').replace(/\D/g, '');
  const message = personalizedContact.dataset.whatsappMessage || '';
  if (/^\d{10,15}$/.test(number) && message) {
    personalizedContact.href = `https://api.whatsapp.com/send/?phone=${number}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
  } else {
    personalizedContact.href = 'https://wa.me/';
    personalizedContact.setAttribute('aria-disabled', 'true');
    personalizedContact.title = 'O número comercial do WhatsApp precisa ser configurado.';
    personalizedContact.addEventListener('click', (event) => event.preventDefault());
  }
}

async function loadProducts() {
  const viewport = document.querySelector('#products-grid');
  const carousel = viewport?.closest('.products-carousel');
  if (!viewport || !carousel) return;
  const toggle = document.querySelector('#products-motion-toggle');
  const previous = carousel.querySelector('.products-previous');
  const next = carousel.querySelector('.products-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const safeUrl = (value) => { if (typeof value !== 'string' || !value.trim()) return null; try { const url = new URL(value.trim(), location.href); return ['https:', 'http:'].includes(url.protocol) && url.origin === location.origin ? url : null; } catch { return null; } };
  const checkoutUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      return url.protocol === 'https:' && (url.hostname === 'kiwify.com.br' || url.hostname.endsWith('.kiwify.com.br')) ? url : null;
    } catch { return null; }
  };
  const money = (value) => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : '';
  const productImage = (product) => safeUrl(product.image);
  const categoryName = (value) => ({ 'cartoes-digitais': 'Cartões digitais', 'livros-colorir': 'Livros de colorir', 'calendarios-organizacao': 'Calendários e organização' }[value] || String(value || 'Destaque').replace(/[-_]/g, ' '));
  let products = [];
  let publishedProductCount = 0;
  let loadFailed = false;
  try {
    const response = await fetch(new URL('/data/products.json', window.location.origin));
    if (!response.ok) throw new Error('Products unavailable');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid products data');
    const publishedProducts = data.filter((product) => product?.status === 'published');
    publishedProductCount = publishedProducts.length;
    products = window.MimoProductData.displayable(publishedProducts.filter((product) => product.featured === true)).slice(0, 8);
  } catch { loadFailed = true; }
  viewport.setAttribute('aria-busy', 'false');
  const showFeaturedState = (failed, hasUnreadyProducts = false) => {
    const state = document.createElement('div'); state.className = `featured-empty-state${failed ? ' is-error' : ''}`;
    state.setAttribute('role', failed ? 'alert' : 'status');
    const ornament = document.createElement('span'); ornament.className = 'featured-empty-ornament'; ornament.setAttribute('aria-hidden', 'true'); ornament.textContent = failed ? '!' : '✦';
    const title = document.createElement('h3'); title.textContent = failed ? 'Não foi possível carregar os destaques' : hasUnreadyProducts ? 'Produtos em preparação' : 'Novos mimos estão sendo preparados';
    const message = document.createElement('p'); message.textContent = failed ? 'Tente novamente em alguns instantes ou explore o catálogo.' : hasUnreadyProducts ? 'As prévias, os arquivos e o checkout estarão disponíveis quando os produtos estiverem prontos para compra.' : 'Em breve, você encontra aqui os produtos publicados da Mimo Digital.';
    state.append(ornament, title, message); viewport.replaceChildren(state);
    viewport.classList.add('is-empty');
    viewport.removeAttribute('tabindex');
    toggle.hidden = true; previous.hidden = true; next.hidden = true;
  };
  if (loadFailed || !products.length) {
    showFeaturedState(loadFailed, publishedProductCount > 0);
    return;
  }
  const dialog = document.querySelector('#featured-product-preview');
  const openPreview = (product) => {
    if (!dialog) return;
    const visual = dialog.querySelector('.featured-preview-image'); visual.replaceChildren();
    const image = productImage(product);
    if (image) { const img = document.createElement('img'); img.src = image.href; img.alt = product.imageAlt || product.name; visual.append(img); }
    else { const placeholder = document.createElement('span'); placeholder.className = 'product-image-placeholder'; placeholder.textContent = 'Pr\u00e9via oficial em prepara\u00e7\u00e3o'; visual.append(placeholder); }
    dialog.querySelector('#featured-preview-title').textContent = product.name;
    dialog.querySelector('.featured-preview-description').textContent = product.fullDescription || product.description;
    const contents = dialog.querySelector('.featured-preview-contents');
    const includedItems = Array.isArray(product.kitContents) ? product.kitContents.join(' · ') : '';
    const includedFiles = Number.isInteger(product.fileCount) && product.fileCount > 0 ? `${product.fileCount} ${product.fileCount === 1 ? 'arquivo incluído' : 'arquivos incluídos'}` : '';
    const format = typeof product.format === 'string' && product.format.trim() ? `Formato: ${product.format.trim()}` : '';
    contents.textContent = [includedItems, includedFiles, format].filter(Boolean).join(' · ');
    contents.hidden = !contents.textContent;
    dialog.querySelector('.featured-preview-price').textContent = money(product.price);
    const action = dialog.querySelector('.featured-preview-action'); action.replaceChildren();
    const url = checkoutUrl(product.checkoutUrl);
    if (url) { const link = document.createElement('a'); link.className = 'btn btn-primary'; link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Comprar'; action.append(link); }
    else { const button = document.createElement('button'); button.className = 'btn btn-primary'; button.type = 'button'; button.disabled = true; button.textContent = 'Em breve'; action.append(button); }
    dialog.showModal(); dialog.querySelector('.featured-preview-close').focus();
  };
  dialog?.querySelector('.featured-preview-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  const makeCard = (product) => {
    const card = document.createElement('article'); card.className = 'card product-card'; card.dataset.productId = product.id || '';
    const frame = document.createElement('div'); frame.className = 'product-image-frame';
    const image = productImage(product);
    if (image) { const img = document.createElement('img'); img.src = image.href; img.alt = product.imageAlt || product.name; img.loading = 'lazy'; img.decoding = 'async'; frame.append(img); }
    else { frame.classList.add('is-placeholder'); const placeholder = document.createElement('span'); placeholder.className = 'product-image-placeholder'; placeholder.textContent = 'Pr\u00e9via oficial em prepara\u00e7\u00e3o'; frame.append(placeholder); }
    const info = document.createElement('div'); info.className = 'product-info';
    const category = document.createElement('span'); category.className = 'product-category'; category.textContent = categoryName(product.category); info.append(category);
    const title = document.createElement('h3'); title.textContent = product.name; info.append(title);
    const description = document.createElement('p'); description.className = 'product-description'; description.textContent = product.shortDescription || product.description; info.append(description);
    const digitalNote = document.createElement('p'); digitalNote.className = 'product-digital-note'; digitalNote.textContent = window.MimoProductData.digitalDeliveryNote; info.append(digitalNote);
    if (Number.isInteger(product.fileCount) && product.fileCount > 0 && typeof product.format === 'string' && product.format.trim()) {
      const fileDetails = document.createElement('p'); fileDetails.className = 'product-description product-files-info'; fileDetails.textContent = `Arquivos incluídos: ${product.fileCount} · Formato: ${product.format}`; info.append(fileDetails);
    }
    const price = document.createElement('p'); price.className = 'product-price'; price.textContent = money(product.price); info.append(price);
    const actions = document.createElement('div'); actions.className = 'product-actions';
    if (window.MimoProductData.hasPreview(product)) {
      const preview = document.createElement('button'); preview.type = 'button'; preview.className = 'product-link product-preview-link'; preview.textContent = 'Ver prévia'; preview.setAttribute('aria-label', `Ver prévia de ${product.name}`); preview.addEventListener('click', () => openPreview(product)); actions.append(preview);
    }
    const buyUrl = checkoutUrl(product.checkoutUrl);
    if (buyUrl) { const buy = document.createElement('a'); buy.className = 'product-link product-checkout-link'; buy.href = buyUrl.href; buy.target = '_blank'; buy.rel = 'noopener noreferrer'; buy.textContent = 'Comprar'; actions.append(buy); }
    else { const unavailable = document.createElement('button'); unavailable.type = 'button'; unavailable.className = 'product-link product-unavailable'; unavailable.textContent = 'Em breve'; unavailable.disabled = true; actions.append(unavailable); }
    info.append(actions); card.append(frame, info); return card;
  };
  {
    const shouldAnimate = products.length >= 4;
    const track = document.createElement('div'); track.className = 'products-track';
    const originalSet = document.createElement('div'); originalSet.className = 'products-track-set';
    products.forEach((product) => originalSet.append(makeCard(product)));
    viewport.replaceChildren(track);
    viewport.classList.add('has-products');
    viewport.classList.toggle('is-static', !shouldAnimate);
    viewport.classList.remove('is-empty', 'manual-navigation');
    if (shouldAnimate) viewport.setAttribute('tabindex', '0');
    else viewport.removeAttribute('tabindex');
    if (!shouldAnimate) {
      track.append(originalSet);
    } else {
    const makeCopy = () => {
      const copy = document.createElement('div'); copy.className = 'products-track-copy'; copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
      products.forEach((product) => copy.append(makeCard(product)));
      return copy;
    };
    const leadingCopy = makeCopy();
    const copies = [makeCopy()]; track.append(leadingCopy, originalSet, ...copies);
    const measure = () => {
      const period = originalSet.getBoundingClientRect().width;
      if (!period) return;
      const copyCount = Math.max(1, Math.ceil(viewport.clientWidth / period));
      while (copies.length < copyCount) { const copy = makeCopy(); copies.push(copy); track.append(copy); }
      while (copies.length > copyCount) copies.pop().remove();
      track.style.setProperty('--products-loop-start', `-${period}px`);
      track.style.setProperty('--products-loop-end', `-${period * 2}px`);
    };
    requestAnimationFrame(measure);
    if ('ResizeObserver' in window) { const observer = new ResizeObserver(measure); observer.observe(viewport); observer.observe(originalSet); }
    else window.addEventListener('resize', measure);
    }
    const sync = () => {
      const manuallyPaused = toggle.getAttribute('aria-pressed') === 'true';
      carousel.classList.toggle('motion-paused', manuallyPaused || reducedMotion.matches);
      toggle.textContent = manuallyPaused ? 'Retomar movimento' : 'Pausar movimento';
      toggle.hidden = !shouldAnimate || reducedMotion.matches;
      previous.hidden = next.hidden = !shouldAnimate || !reducedMotion.matches;
      carousel.classList.toggle('manual-controls', shouldAnimate && reducedMotion.matches);
      viewport.classList.toggle('manual-navigation', shouldAnimate && reducedMotion.matches);
    };
    toggle.addEventListener('click', () => { toggle.setAttribute('aria-pressed', String(toggle.getAttribute('aria-pressed') !== 'true')); sync(); });
    previous.addEventListener('click', () => viewport.scrollBy({ left: -viewport.clientWidth * .8, behavior: 'auto' }));
    next.addEventListener('click', () => viewport.scrollBy({ left: viewport.clientWidth * .8, behavior: 'auto' }));
    reducedMotion.addEventListener?.('change', () => { viewport.scrollLeft = 0; sync(); }); sync();
  }
}
loadProducts();
// O script oficial do Brevo valida os campos e controla a resposta real do envio.
const brevoSuccess = document.querySelector('#success-message');
const brevoError = document.querySelector('#error-message');
const brevoForm = document.querySelector('#sib-form');
const brevoContainer = document.querySelector('#sib-form-container');
const brevoSubmitButton = brevoForm?.querySelector('button[type="submit"]');
const brevoSubmitLabel = brevoSubmitButton?.querySelector('span');
const brevoIdleLabel = brevoSubmitLabel?.textContent || '';
let brevoSubmissionPending = false;

const setBrevoSubmissionPending = (pending) => {
  brevoSubmissionPending = pending;
  brevoForm?.setAttribute('aria-busy', String(pending));
  brevoSubmitButton?.setAttribute('aria-busy', String(pending));
  if (brevoSubmitLabel) brevoSubmitLabel.textContent = pending ? 'Enviando…' : brevoIdleLabel;
};

brevoForm?.addEventListener('submit', (event) => {
  if (brevoSubmissionPending) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  brevoSuccess?.classList.remove('sib-form-message-panel--active');
  brevoError?.classList.remove('sib-form-message-panel--active');
  setBrevoSubmissionPending(true);

  // Brevo validates the form in its submit listener and disables the button
  // synchronously only when it starts a request. Clear the pending state when
  // that validation blocks submission, so the visitor can correct the fields.
  queueMicrotask(() => {
    if (brevoSubmissionPending && !brevoSubmitButton?.disabled) {
      setBrevoSubmissionPending(false);
    }
  });
}, { capture: true });

const updateBrevoMessages = (records = []) => {
  const successActive = brevoSuccess?.classList.contains('sib-form-message-panel--active');
  const errorActive = brevoError?.classList.contains('sib-form-message-panel--active');
  if (successActive && errorActive) {
    const lastActivated = [...records].reverse().find((record) => record.attributeName === 'class' && record.target.classList.contains('sib-form-message-panel--active'))?.target;
    (lastActivated === brevoError ? brevoSuccess : brevoError).classList.remove('sib-form-message-panel--active');
  }
  const hasResponseMessage = brevoSuccess?.classList.contains('sib-form-message-panel--active')
    || brevoError?.classList.contains('sib-form-message-panel--active');
  const formReplacedByBrevo = brevoForm && !brevoForm.isConnected;
  if (brevoSubmissionPending && (hasResponseMessage || formReplacedByBrevo)) {
    setBrevoSubmissionPending(false);
  }
};
if (brevoContainer && (brevoSuccess || brevoError)) {
  const brevoMessageObserver = new MutationObserver(updateBrevoMessages);
  brevoMessageObserver.observe(brevoContainer, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true
  });
  updateBrevoMessages();
}
