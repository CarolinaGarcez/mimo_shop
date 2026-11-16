(() => {
  const safeImageUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim(), window.location.href);
      return ['https:', 'http:'].includes(url.protocol) && url.origin === window.location.origin ? url : null;
    } catch { return null; }
  };

  const isDisplayable = (product) => {
    if (!product || product.status !== 'published' || typeof product.id !== 'string' || !product.id.trim() ||
        typeof product.name !== 'string' || !product.name.trim() ||
        typeof (product.shortDescription || product.description) !== 'string' || !(product.shortDescription || product.description).trim() ||
        typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price <= 0 ||
        typeof product.category !== 'string' || !product.category.trim() ||
        !Array.isArray(product.kitContents) || !product.kitContents.some((item) => typeof item === 'string' && item.trim())) return false;
    return true;
  };

  window.MimoProductData = Object.freeze({
    displayable: (products) => (Array.isArray(products) ? products : []).filter(isDisplayable),
    hasPreview: (product) => Boolean(safeImageUrl(product?.image) || (Array.isArray(product?.previewImages) && product.previewImages.some(safeImageUrl)))
  });
})();
