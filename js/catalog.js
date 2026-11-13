(() => {
  const grid = document.querySelector('#catalog-grid');
  if (!grid) return;

  const search = document.querySelector('#catalog-search');
  const subcategoryWrap = document.querySelector('#catalog-subcategory-wrap');
  const subcategory = document.querySelector('#catalog-subcategory');
  const count = document.querySelector('#catalog-result-count');
  const clearButton = document.querySelector('#catalog-clear');
  const error = document.querySelector('#catalog-error');
  const dialog = document.querySelector('#product-preview');
  const categoryNames = {
    'cartoes-digitais': 'Cartões',
    'livros-colorir': 'Livros de colorir',
    'calendarios-organizacao': 'Calendários'
  };
  const subcategoryOptions = {
    'cartoes-digitais': [{ value: 'natal', label: 'Natal' }],
    'livros-colorir': [
      { value: 'infantil', label: 'Infantil' },
      { value: 'antiestresse', label: 'Antiestresse' }
    ]
  };
  const categoryButtons = [...document.querySelectorAll('[data-category]')];
  const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
  const safeCheckout = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && (url.hostname === 'kiwify.com.br' || url.hostname.endsWith('.kiwify.com.br')) ? url.href : null;
    } catch { return null; }
  };
  const getState = () => {
    const params = new URLSearchParams(location.search);
    return {
      category: categoryNames[params.get('categoria')] ? params.get('categoria') : 'all',
      subcategory: params.get('subcategoria') || '',
      search: params.get('busca') || ''
    };
  };
  let state = getState();
  let products = [];
  let returnFocus = null;
  let previousBodyOverflow = '';

  const setSubcategoryOptions = () => {
    const options = subcategoryOptions[state.category] || [];
    subcategoryWrap.hidden = options.length === 0;
    subcategory.replaceChildren(new Option('Todas', ''));
    options.forEach((option) => subcategory.add(new Option(option.label, option.value)));
    if (options.some((option) => option.value === state.subcategory)) subcategory.value = state.subcategory;
    else state.subcategory = '';
  };

  const syncUrl = () => {
    const params = new URLSearchParams();
    if (state.category !== 'all') params.set('categoria', state.category);
    if (state.subcategory) params.set('subcategoria', state.subcategory);
    if (state.search.trim()) params.set('busca', state.search.trim());
    const query = params.toString();
    history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}`);
  };

  const matches = (product) => {
    if (product.status !== 'published') return false;
    if (state.category !== 'all' && product.category !== state.category) return false;
    if (state.subcategory && product.subcategory !== state.subcategory) return false;
    const query = normalize(state.search);
    if (!query) return true;
    return normalize([
      product.name,
      product.shortDescription,
      product.description,
      product.fullDescription,
      product.category,
      product.subcategory
    ].filter(Boolean).join(' ')).includes(query);
  };

  const makeBuyControl = (product, className = 'catalog-buy') => {
    const checkout = safeCheckout(product.checkoutUrl);
    if (!checkout) {
      const button = document.createElement('button');
      button.className = `${className} is-disabled`;
      button.type = 'button';
      button.disabled = true;
      button.textContent = 'Em breve';
      return button;
    }
    const link = document.createElement('a');
    link.className = className;
    link.href = checkout;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Comprar';
    return link;
  };

  const createImage = (src, alt, className) => {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.className = className || '';
    image.addEventListener('error', () => {
      const placeholder = document.createElement('div');
      placeholder.className = 'catalog-image-placeholder';
      placeholder.setAttribute('role', 'img');
      placeholder.setAttribute('aria-label', alt || 'Imagem indisponível');
      placeholder.textContent = 'Prévia em breve';
      image.replaceWith(placeholder);
    }, { once: true });
    return image;
  };

  const openPreview = (product, trigger) => {
    returnFocus = trigger;
    const productSubcategory = (subcategoryOptions[product.category] || []).find((option) => option.value === product.subcategory)?.label;
    document.querySelector('#preview-category').textContent = `${categoryNames[product.category] || ''}${productSubcategory ? ` · ${productSubcategory}` : ''}`;
    document.querySelector('#preview-title').textContent = product.name;
    document.querySelector('#preview-description').textContent = product.fullDescription || product.description || product.shortDescription || '';
    document.querySelector('#preview-price').textContent = typeof product.price === 'number'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
      : '';
    const kit = document.querySelector('#preview-kit');
    kit.replaceChildren(...(Array.isArray(product.kitContents) ? product.kitContents : []).map((item) => {
      const li = document.createElement('li'); li.textContent = item; return li;
    }));
    const format = document.querySelector('#preview-format');
    format.hidden = !(typeof product.format === 'string' && product.format.trim());
    format.textContent = format.hidden ? '' : product.format;
    const gallery = document.querySelector('#preview-gallery');
    const images = [product.image, ...(Array.isArray(product.previewImages) ? product.previewImages : [])].filter(Boolean);
    gallery.replaceChildren();
    if (images.length) images.forEach((src, index) => gallery.append(createImage(src, index === 0 ? product.imageAlt || product.name : `${product.name}, imagem de prévia ${index}`, 'preview-image')));
    else {
      const placeholder = document.createElement('div');
      placeholder.className = 'catalog-image-placeholder preview-placeholder';
      placeholder.textContent = 'Imagem em breve';
      gallery.append(placeholder);
    }
    const buy = document.querySelector('#preview-buy');
    buy.replaceChildren(makeBuyControl(product, 'catalog-buy preview-buy-button'));
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('.product-preview-close').focus();
  };

  const render = () => {
    setSubcategoryOptions();
    categoryButtons.forEach((button) => {
      const selected = button.dataset.category === state.category;
      button.setAttribute('aria-pressed', String(selected));
    });
    search.value = state.search;
    subcategory.value = state.subcategory;
    const results = products.filter(matches);
    count.textContent = `${results.length} ${results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
    clearButton.disabled = state.category === 'all' && !state.subcategory && !state.search;
    grid.replaceChildren();
    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'catalog-empty';
      const heading = document.createElement('h2'); heading.textContent = 'Nenhum mimo por aqui';
      const message = document.createElement('p'); message.textContent = 'Tente buscar por outro termo ou limpar os filtros para ver os produtos disponíveis.';
      empty.append(heading, message);
      grid.append(empty);
      syncUrl();
      return;
    }
    results.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'catalog-card';
      card.dataset.productId = product.id;
      const media = document.createElement('div'); media.className = 'catalog-card-media';
      if (product.image) media.append(createImage(product.image, product.imageAlt || product.name, 'catalog-card-image'));
      else {
        const placeholder = document.createElement('div');
        placeholder.className = 'catalog-image-placeholder';
        placeholder.textContent = 'Imagem em breve';
        media.append(placeholder);
      }
      const body = document.createElement('div'); body.className = 'catalog-card-body';
      const category = document.createElement('p'); category.className = 'catalog-card-category';
      const subcategoryLabel = (subcategoryOptions[product.category] || []).find((option) => option.value === product.subcategory)?.label;
      category.textContent = `${categoryNames[product.category] || ''}${subcategoryLabel ? ` · ${subcategoryLabel}` : ''}`;
      const title = document.createElement('h2'); title.textContent = product.name;
      const description = document.createElement('p'); description.className = 'catalog-card-description'; description.textContent = product.shortDescription || product.description;
      const contents = document.createElement('p'); contents.className = 'catalog-card-kit';
      contents.textContent = Array.isArray(product.kitContents) ? product.kitContents.join(' · ') : '';
      const price = document.createElement('p'); price.className = 'catalog-card-price';
      price.textContent = typeof product.price === 'number' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) : '';
      const actions = document.createElement('div'); actions.className = 'catalog-card-actions';
      const preview = document.createElement('button'); preview.className = 'catalog-preview-button'; preview.type = 'button'; preview.textContent = 'Ver prévia';
      preview.addEventListener('click', () => openPreview(product, preview));
      actions.append(preview, makeBuyControl(product));
      body.append(category, title, description);
      if (contents.textContent) body.append(contents);
      body.append(price, actions);
      card.append(media, body);
      grid.append(card);
    });
    syncUrl();
  };

  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    state.category = button.dataset.category;
    state.subcategory = '';
    render();
  }));
  search.addEventListener('input', () => { state.search = search.value; render(); });
  subcategory.addEventListener('change', () => { state.subcategory = subcategory.value; render(); });
  clearButton.addEventListener('click', () => { state = { category: 'all', subcategory: '', search: '' }; render(); search.focus(); });
  addEventListener('popstate', () => { state = getState(); render(); });
  dialog.querySelector('.product-preview-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousBodyOverflow;
    returnFocus?.focus();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  fetch('data/products.json')
    .then((response) => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); })
    .then((data) => {
      products = Array.isArray(data) ? data.filter((product) => product && product.status === 'published' && typeof product.id === 'string' && typeof product.name === 'string') : [];
      error.hidden = true;
      render();
    })
    .catch(() => { error.hidden = false; products = []; render(); });
})();
