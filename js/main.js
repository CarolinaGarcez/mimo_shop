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
  const safeUrl = (value) => { if (typeof value !== 'string' || !value.trim()) return null; try { const url = new URL(value.trim(), location.href); return ['https:', 'http:'].includes(url.protocol) ? url : null; } catch { return null; } };
  const checkoutUrl = (value) => { const url = safeUrl(value); return url?.protocol === 'https:' && (url.hostname === 'kiwify.com.br' || url.hostname.endsWith('.kiwify.com.br')) ? url : null; };
  const money = (value) => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : '';
  const productImage = (product) => safeUrl(product.image) || (product.category === 'cartoes-digitais' ? safeUrl('assets/img/categoria/Cart%C3%B5es.png') : null);
  const categoryName = (value) => ({ 'cartoes-digitais': 'Cartões digitais', 'livros-colorir': 'Livros de colorir', 'calendarios-organizacao': 'Calendários e organização' }[value] || String(value || 'Destaque').replace(/[-_]/g, ' '));
  let products = [];
  try { const response = await fetch('data/products.json'); if (response.ok) { const data = await response.json(); products = Array.isArray(data) ? data.filter((p) => p?.status === 'published' && p.featured === true && p.name?.trim() && p.description?.trim()).slice(0, 8) : []; } } catch { /* mantém placeholder */ }
  const dialog = document.querySelector('#featured-product-preview');
  const openPreview = (product) => {
    if (!dialog) return;
    const visual = dialog.querySelector('.featured-preview-image'); visual.replaceChildren();
    const image = productImage(product);
    if (image) { const img = document.createElement('img'); img.src = image.href; img.alt = product.imageAlt || (product.image ? product.name : 'Ilustração em aquarela de cartões digitais'); visual.append(img); }
    else { const mark = document.createElement('span'); mark.className = 'product-image-placeholder'; mark.textContent = '✦'; mark.setAttribute('aria-hidden', 'true'); visual.append(mark); }
    dialog.querySelector('#featured-preview-title').textContent = product.name;
    dialog.querySelector('.featured-preview-description').textContent = product.fullDescription || product.description;
    const contents = dialog.querySelector('.featured-preview-contents'); contents.textContent = Array.isArray(product.kitContents) ? product.kitContents.join(' · ') : ''; contents.hidden = !contents.textContent;
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
    if (image) { const img = document.createElement('img'); img.src = image.href; img.alt = product.imageAlt || (product.image ? product.name : 'Ilustração em aquarela de cartões digitais'); img.loading = 'lazy'; img.decoding = 'async'; frame.append(img); }
    else { frame.classList.add('is-placeholder'); const mark = document.createElement('span'); mark.className = 'product-image-placeholder'; mark.textContent = '✦'; mark.setAttribute('aria-hidden', 'true'); frame.append(mark); }
    const info = document.createElement('div'); info.className = 'product-info';
    const category = document.createElement('span'); category.className = 'product-category'; category.textContent = categoryName(product.category); info.append(category);
    const title = document.createElement('h3'); title.textContent = product.name; info.append(title);
    const description = document.createElement('p'); description.className = 'product-description'; description.textContent = product.shortDescription || product.description; info.append(description);
    const price = document.createElement('p'); price.className = 'product-price'; price.textContent = money(product.price); info.append(price);
    const actions = document.createElement('div'); actions.className = 'product-actions';
    const preview = document.createElement('button'); preview.type = 'button'; preview.className = 'product-link product-preview-link'; preview.textContent = 'Ver prévia'; preview.setAttribute('aria-label', `Ver prévia de ${product.name}`); preview.addEventListener('click', () => openPreview(product)); actions.append(preview);
    const buyUrl = checkoutUrl(product.checkoutUrl);
    if (buyUrl) { const buy = document.createElement('a'); buy.className = 'product-link product-checkout-link'; buy.href = buyUrl.href; buy.target = '_blank'; buy.rel = 'noopener noreferrer'; buy.textContent = 'Comprar'; actions.append(buy); }
    else { const unavailable = document.createElement('button'); unavailable.type = 'button'; unavailable.className = 'product-link product-unavailable'; unavailable.textContent = 'Em breve'; unavailable.disabled = true; actions.append(unavailable); }
    info.append(actions); card.append(frame, info); return card;
  };
  if (products.length) {
    const track = document.createElement('div'); track.className = 'products-track';
    const originalSet = document.createElement('div'); originalSet.className = 'products-track-set';
    products.forEach((product) => originalSet.append(makeCard(product)));
    const makeCopy = () => {
      const copy = document.createElement('div'); copy.className = 'products-track-copy'; copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
      products.forEach((product) => copy.append(makeCard(product)));
      return copy;
    };
    const leadingCopy = makeCopy();
    const copies = [makeCopy()]; track.append(leadingCopy, originalSet, ...copies); viewport.replaceChildren(track); viewport.classList.add('has-products');
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
    const manuallyPaused = toggle?.getAttribute('aria-pressed') === 'true';
    carousel.classList.toggle('motion-paused', manuallyPaused || reducedMotion.matches);
    if (toggle) toggle.textContent = manuallyPaused ? 'Retomar movimento' : 'Pausar movimento';
    previous.hidden = next.hidden = !reducedMotion.matches || !products.length;
    carousel.classList.toggle('manual-controls', reducedMotion.matches && products.length > 0);
    viewport.classList.toggle('manual-navigation', reducedMotion.matches);
  };
  toggle?.addEventListener('click', () => { toggle.setAttribute('aria-pressed', String(toggle.getAttribute('aria-pressed') !== 'true')); sync(); });
  previous.addEventListener('click', () => viewport.scrollBy({ left: -viewport.clientWidth * .8, behavior: 'auto' }));
  next.addEventListener('click', () => viewport.scrollBy({ left: viewport.clientWidth * .8, behavior: 'auto' }));
  reducedMotion.addEventListener?.('change', sync); sync();
}
loadProducts();
// O script oficial do Brevo valida os campos e controla a resposta real do envio.
const brevoSuccess = document.querySelector('#success-message');
const brevoError = document.querySelector('#error-message');
const updateBrevoMessages = () => {
  if (brevoSuccess?.classList.contains('sib-form-message-panel--active')) {
    const text = brevoSuccess.querySelector('.sib-form-message-panel__inner-text');
    if (text) text.textContent = 'Prontinho! Seu e-mail foi cadastrado para receber novidades do Mimo Digital. 💗';
  }
  if (brevoError?.classList.contains('sib-form-message-panel--active')) {
    const text = brevoError.querySelector('.sib-form-message-panel__inner-text');
    if (text) text.textContent = 'Não conseguimos concluir sua inscrição. Tente novamente.';
  }
};
if (brevoSuccess && brevoError) {
  const brevoMessageObserver = new MutationObserver(updateBrevoMessages);
  [brevoSuccess, brevoError].forEach((panel) => brevoMessageObserver.observe(panel, {
    attributes: true,
    attributeFilter: ['class']
  }));
}
