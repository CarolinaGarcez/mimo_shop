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
    personalizedContact.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  } else {
    personalizedContact.href = 'https://wa.me/';
    personalizedContact.setAttribute('aria-disabled', 'true');
    personalizedContact.title = 'O número comercial do WhatsApp precisa ser configurado.';
    personalizedContact.addEventListener('click', (event) => event.preventDefault());
  }
}

async function loadProducts() {
  const grid = document.querySelector('#products-grid');
  if (!grid) return;

  const carousel = grid.closest('.products-carousel');
  const previousButton = carousel?.querySelector('.products-previous');
  const nextButton = carousel?.querySelector('.products-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let originals = [...grid.children];

  try {
    const response = await fetch('data/products.json');
    if (response.ok) {
      const products = await response.json();
      const featuredProducts = Array.isArray(products)
        ? products.filter((product) => product?.featured === true && product.name && product.image)
        : [];
      if (featuredProducts.length) {
        let productCardNumber = 0;
        originals = featuredProducts.map((product) => {
          const card = document.createElement('article');
          card.className = 'card product-card';
          card.tabIndex = 0;
          card.setAttribute('aria-label', product.name);
          if (product.id !== undefined && product.id !== null) card.dataset.productId = String(product.id);

          const imageFrame = document.createElement('div');
          imageFrame.className = 'product-image-frame';
          const image = document.createElement('img');
          image.src = product.image;
          image.alt = product.imageAlt || product.name;
          image.loading = 'lazy';
          image.decoding = 'async';
          imageFrame.append(image);
          card.append(imageFrame);

          const details = document.createElement('div');
          details.className = 'product-info';
          details.id = `product-info-${++productCardNumber}`;
          if (product.category) {
            const category = document.createElement('span');
            category.className = 'product-category';
            category.textContent = product.category;
            details.append(category);
          }

          const title = document.createElement('h3');
          title.textContent = product.name;
          details.append(title);

          if (product.description) {
            const description = document.createElement('p');
            description.className = 'product-description';
            description.textContent = product.description;
            details.append(description);
          }

          if (product.price !== undefined && product.price !== null && product.price !== '') {
            const price = document.createElement('p');
            price.className = 'product-price';
            price.textContent = typeof product.price === 'number'
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
              : String(product.price);
            details.append(price);
          }

          const productUrl = product.url || product.detailsUrl;
          if (productUrl) {
            try {
              const detailsUrl = new URL(productUrl, window.location.href);
              if (detailsUrl.protocol === 'https:' || detailsUrl.protocol === 'http:') {
                const link = document.createElement('a');
                link.className = 'product-link';
                link.href = detailsUrl.href;
                link.textContent = 'Ver produto';
                details.append(link);
              }
            } catch { /* omite destinos inválidos até o catálogo ser corrigido */ }
          }

          card.append(details);

          const reveal = document.createElement('button');
          reveal.className = 'product-reveal-toggle';
          reveal.type = 'button';
          reveal.setAttribute('aria-expanded', 'false');
          reveal.setAttribute('aria-controls', details.id);
          reveal.setAttribute('aria-label', `Mostrar informações de ${product.name}`);
          card.append(reveal);
          return card;
        });
      }
    }
  } catch { /* os cards provisórios continuam disponíveis sem catálogo */ }

  grid.replaceChildren(...originals);
  const productCount = originals.filter((card) => card.classList.contains('product-card')).length;
  const count = originals.length;
  if (productCount < 4 || !carousel || !previousButton || !nextButton) return;

  const cloneCard = (card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.dataset.carouselClone = 'true';
    clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((item) => item.setAttribute('tabindex', '-1'));
    clone.querySelectorAll('[id]').forEach((item) => item.removeAttribute('id'));
    return clone;
  };
  const leadingClones = originals.map(cloneCard);
  const trailingClones = originals.map(cloneCard);
  grid.replaceChildren(...leadingClones, ...originals, ...trailingClones);
  originals.forEach((card, index) => {
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    const productName = card.querySelector('h3')?.textContent;
    card.setAttribute('aria-label', `${productName ? `${productName}, ` : ''}${index + 1} de ${count}`);
  });
  grid.classList.add('is-carousel');
  carousel.classList.add('has-products-carousel');
  carousel.setAttribute('aria-roledescription', 'carrossel');
  grid.setAttribute('aria-label', 'Use as setas para navegar pelos produtos em destaque. Também é possível deslizar a lista.');
  previousButton.hidden = false;
  nextButton.hidden = false;

  let cards = [...grid.children];
  let currentIndex = count;
  let autoplay = null;
  let resumeAutoplay = null;
  let scrollIdle = null;
  let animationFrame = null;
  let previousSnapType = null;
  let pointerInside = false;

  const cardOffset = (card) => card.getBoundingClientRect().left - grid.getBoundingClientRect().left + grid.scrollLeft;
  const jumpTo = (left) => {
    const previousBehavior = grid.style.scrollBehavior;
    grid.style.scrollBehavior = 'auto';
    grid.scrollLeft = left;
    grid.style.scrollBehavior = previousBehavior;
  };
  const cancelMove = () => {
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    if (previousSnapType !== null) {
      grid.style.scrollSnapType = previousSnapType;
      previousSnapType = null;
    }
  };
  const setPosition = (index, behavior = 'smooth') => {
    const boundedIndex = Math.max(0, Math.min(index, cards.length - 1));
    currentIndex = boundedIndex;
    cancelMove();
    const target = cardOffset(cards[boundedIndex]);
    if (reducedMotion.matches || behavior === 'instant') {
      jumpTo(target);
      return;
    }
    const start = grid.scrollLeft;
    let startedAt = null;
    const duration = 700;
    previousSnapType = grid.style.scrollSnapType;
    grid.style.scrollSnapType = 'none';
    const animate = (now) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      jumpTo(start + (target - start) * eased);
      if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
      else cancelMove();
    };
    animationFrame = window.requestAnimationFrame(animate);
  };
  const stopAutoplay = () => {
    window.clearInterval(autoplay);
    window.clearTimeout(resumeAutoplay);
    autoplay = null;
    resumeAutoplay = null;
  };
  const canAutoplay = () => !reducedMotion.matches && !document.hidden && !pointerInside && !carousel.contains(document.activeElement);
  const startAutoplay = () => {
    stopAutoplay();
    if (!canAutoplay()) return;
    autoplay = window.setInterval(() => setPosition(currentIndex + 1), 3600);
  };
  const scheduleAutoplay = () => {
    stopAutoplay();
    if (!canAutoplay()) return;
    resumeAutoplay = window.setTimeout(startAutoplay, 3600);
  };
  const normalizeLoop = () => {
    const nearestIndex = cards.reduce((nearest, card, index) =>
      Math.abs(cardOffset(card) - grid.scrollLeft) < Math.abs(cardOffset(cards[nearest]) - grid.scrollLeft) ? index : nearest, 0);
    currentIndex = nearestIndex;
    if (nearestIndex < count) {
      currentIndex = nearestIndex + count;
      jumpTo(cardOffset(cards[currentIndex]));
    } else if (nearestIndex >= count * 2) {
      currentIndex = nearestIndex - count;
      jumpTo(cardOffset(cards[currentIndex]));
    }
  };

  const setCardExpanded = (card, expanded) => {
    const reveal = card?.querySelector('.product-reveal-toggle');
    if (!card || !reveal) return;
    card.classList.toggle('is-active', expanded);
    reveal.setAttribute('aria-expanded', String(expanded));
  };
  const closeExpandedCards = (except = null) => {
    grid.querySelectorAll('.product-card.is-active').forEach((card) => {
      if (card !== except) setCardExpanded(card, false);
    });
  };
  let touchStartX = 0;
  let touchMoved = false;
  let suppressTap = false;

  carousel.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.product-card')) closeExpandedCards();
    if (event.pointerType === 'touch') {
      touchStartX = event.clientX;
      touchMoved = false;
      return;
    }
  });
  carousel.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' && Math.abs(event.clientX - touchStartX) > 10) touchMoved = true;
  }, { passive: true });
  carousel.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch' && touchMoved) {
      suppressTap = true;
      closeExpandedCards();
      window.setTimeout(() => { suppressTap = false; }, 0);
    }
  });
  carousel.addEventListener('click', (event) => {
    const reveal = event.target.closest('.product-reveal-toggle');
    const card = event.target.closest('.product-card');
    if (!card || event.target.closest('a')) return;
    if (suppressTap) {
      event.preventDefault();
      return;
    }
    if (!reveal && !window.matchMedia('(hover: none)').matches) return;
    const expanded = card.classList.contains('is-active');
    closeExpandedCards(card);
    setCardExpanded(card, reveal && event.detail === 0 ? true : !expanded);
  });

  jumpTo(cardOffset(cards[currentIndex]));
  grid.addEventListener('scroll', () => {
    window.clearTimeout(scrollIdle);
    scrollIdle = window.setTimeout(normalizeLoop, 140);
  }, { passive: true });
  previousButton.addEventListener('click', () => { closeExpandedCards(); setPosition(currentIndex - 1); scheduleAutoplay(); });
  nextButton.addEventListener('click', () => { closeExpandedCards(); setPosition(currentIndex + 1); scheduleAutoplay(); });
  grid.addEventListener('keydown', (event) => {
    if (event.target !== grid && !event.target.matches('.product-card')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      closeExpandedCards();
      setPosition(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  carousel.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') { pointerInside = true; stopAutoplay(); }
  });
  carousel.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') { pointerInside = false; startAutoplay(); }
  });
  carousel.addEventListener('focusin', (event) => {
    stopAutoplay();
    const card = event.target.closest('.product-card');
    if (card && event.target.matches('.product-reveal-toggle')) setCardExpanded(card, true);
  });
  carousel.addEventListener('focusout', (event) => {
    const card = event.target.closest('.product-card');
    if (card && !card.contains(event.relatedTarget)) setCardExpanded(card, false);
    if (!carousel.contains(event.relatedTarget)) scheduleAutoplay();
  });
  carousel.addEventListener('touchstart', () => { stopAutoplay(); cancelMove(); }, { passive: true });
  carousel.addEventListener('touchend', scheduleAutoplay, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) { stopAutoplay(); cancelMove(); }
    else startAutoplay();
  });
  window.addEventListener('resize', () => {
    cards = [...grid.children];
    cancelMove();
    jumpTo(cardOffset(cards[currentIndex]));
  });
  startAutoplay();
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
