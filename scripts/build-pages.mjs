import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public');
const productionBase = 'https://mimo-shop.pages.dev';

const files = [
  '404.html',
  'catalogo.html',
  'contato.html',
  'entrega-digital.html',
  'index.html',
  'privacidade.html',
  'termos.html',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  'css/styles.css',
  'css/tokens.css',
  'data/products.json',
  'js/catalog.js',
  'js/main.js',
  'js/product-data.js',
  'assets/img/bg/Fundo.webp',
  'assets/img/bg/banner.png',
  'assets/img/bg/banner.webp',
  'assets/img/bg/banner_footer.webp',
  'assets/img/categoria/calendario.webp',
  'assets/img/categoria/cartao_natal.webp',
  'assets/img/categoria/livro.webp',
  'assets/img/categoria/personalizado.webp',
  'assets/img/elementos/dw.webp',
  'assets/img/elementos/lot.webp',
  'assets/img/elementos/raio.webp',
  'assets/img/elementos/s2.webp',
  'assets/img/elementos/star.webp',
  'assets/img/ilustracoes/hero.webp',
  'assets/img/ilustracoes/lotus.webp',
  'assets/img/logo/logo1.webp',
  'assets/img/logo/principal.webp',
  'assets/img/produtos/cartoes/coleção de Natal em aquarela.png',
  'assets/img/produtos/cartoes/coleção Os Biscoitos_ cartões natalinos retrô.png',
  'assets/img/vira mato/selo_viramato.webp',
];

const canonicalPages = new Map([
  ['index.html', `${productionBase}/`],
  ['catalogo.html', `${productionBase}/catalogo`],
  ['contato.html', `${productionBase}/contato`],
  ['entrega-digital.html', `${productionBase}/entrega-digital`],
  ['privacidade.html', `${productionBase}/privacidade`],
  ['termos.html', `${productionBase}/termos`],
]);

const routes = new Map([
  ['/', 'index.html'],
  ['/catalogo', 'catalogo.html'],
  ['/contato', 'contato.html'],
  ['/entrega-digital', 'entrega-digital.html'],
  ['/privacidade', 'privacidade.html'],
  ['/termos', 'termos.html'],
]);

function fail(message) {
  console.error(`Pages build failed: ${message}`);
  process.exit(1);
}

function listFiles(directory, base = directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFiles(fullPath, base));
    } else if (entry.isFile()) {
      result.push(path.relative(base, fullPath).split(path.sep).join('/'));
    }
  }
  return result.sort();
}

function hasExactSourcePath(relativePath) {
  let current = root;
  for (const segment of relativePath.split('/')) {
    let names;
    try {
      names = readdirSync(current);
    } catch {
      return false;
    }
    if (!names.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return existsSync(current) && statSync(current).isFile();
}

function readSource(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

const missingSources = files.filter((file) => !hasExactSourcePath(file));
if (missingSources.length) fail(`source files missing or case differs: ${missingSources.join(', ')}`);

let products;
try {
  products = JSON.parse(readSource('data/products.json'));
} catch {
  fail('data/products.json is not valid JSON');
}
if (!Array.isArray(products)) fail('data/products.json must contain a product array');

// Product image paths are assigned dynamically by the homepage and catalog.
// Validate every record so adding a product cannot silently publish a missing
// or unapproved asset.
for (const product of products) {
  if (!product || typeof product !== 'object') fail('every product record must be an object');
  const previewImages = product.previewImages ?? [];
  if (!Array.isArray(previewImages)) fail(`previewImages for ${product.id ?? 'unknown product'} must be an array`);
  for (const image of [product.image, ...previewImages].filter(Boolean)) {
    if (typeof image !== 'string' || !files.includes(image) || !hasExactSourcePath(image)) {
      fail(`product image for ${product.id ?? 'unknown product'} must point to an existing asset included in the publication allowlist`);
    }
  }
}

const expectedProducts = new Map([
  ['natal-em-aquarela', {
    name: 'Kit Natal em Aquarela — 10 Cartões Digitais',
    price: 14.9,
    category: 'cartoes-digitais',
    subcategory: 'natal',
    checkoutUrl: 'https://pay.kiwify.com.br/uiqNrZi',
  }],
  ['os-biscoitos', {
    name: 'Kit Natal Biscoitinhos — 10 Cartões Digitais',
    price: 14.9,
    category: 'cartoes-digitais',
    subcategory: 'natal',
    checkoutUrl: 'https://pay.kiwify.com.br/8NNTQpx',
  }],
  ['kit-13', {
    name: 'Kit 13 — 10 Cartões Digitais',
    price: 14.9,
    category: 'cartoes-digitais',
    subcategory: 'natal',
    checkoutUrl: 'https://pay.kiwify.com.br/VO93vv0',
  }],
]);
for (const [id, expected] of expectedProducts) {
  const matches = products.filter((product) => product?.id === id);
  if (matches.length !== 1) fail(`expected one product record for ${id}`);
  const [product] = matches;
  const cards = (product.kitContents ?? []).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (product.name !== expected.name || product.price !== expected.price || product.category !== expected.category ||
      product.subcategory !== expected.subcategory || product.checkoutUrl !== expected.checkoutUrl ||
      !/\b10\b.*cartoes|cartoes.*\b10\b/.test(cards)) {
    fail(`name, price, category, subcategory, checkout and 10-card kit must match the approved data for ${id}`);
  }
  if (typeof product.image !== 'string' || !Array.isArray(product.previewImages)) {
    fail(`image and previewImages fields for ${id} must use the published product schema`);
  }
  const checkout = product.checkoutUrl ?? '';
  if (checkout !== '') {
    let url;
    try { url = new URL(checkout); } catch { fail(`checkoutUrl for ${id} is not a valid URL`); }
    if (url.protocol !== 'https:' || !(url.hostname === 'kiwify.com.br' || url.hostname.endsWith('.kiwify.com.br'))) {
      fail(`checkoutUrl for ${id} must be empty or a Kiwify HTTPS URL`);
    }
  }
}

// The catalog and homepage set img.src from product.image and product.previewImages.
// Product paths above are checked against the allowlist; catch any separate image
// paths embedded directly in JavaScript as well.
for (const scriptFile of ['js/catalog.js', 'js/main.js', 'js/product-data.js']) {
  const script = readSource(scriptFile);
  const assetReferences = [...script.matchAll(/["'`](\/?assets\/[^"'`\s?#]+\.(?:avif|gif|jpe?g|png|svg|webp))["'`]/gi)];
  for (const [, assetPath] of assetReferences) {
    const relativePath = decodeURIComponent(assetPath).replace(/^\//, '');
    if (!files.includes(relativePath) || !hasExactSourcePath(relativePath)) {
      fail(`${scriptFile} references an image outside the publication allowlist: ${assetPath}`);
    }
  }
}

for (const [page, canonical] of canonicalPages) {
  const html = readSource(page);
  const headings = html.match(/<h1\b/gi) ?? [];
  const canonicalMatch = html.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"/i);
  if (!/<html\b[^>]*\blang="pt-BR"/i.test(html) || headings.length !== 1) {
    fail(`${page} must declare pt-BR and exactly one H1`);
  }
  if (canonicalMatch?.[1] !== canonical) fail(`canonical URL is missing or inconsistent in ${page}`);
}

const sitemapText = readSource('sitemap.xml');
if (!/^<\?xml\s+version="1\.0"\s+encoding="UTF-8"\?>\s*<urlset\b[\s\S]*<\/urlset>\s*$/i.test(sitemapText)) {
  fail('sitemap.xml has an invalid XML document structure');
}
const sitemapUrls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
const expectedSitemapUrls = [...canonicalPages.values()].sort();
if (sitemapUrls.length !== expectedSitemapUrls.length || sitemapUrls.some((url, index) => url !== expectedSitemapUrls[index])) {
  fail('sitemap.xml URLs do not match the public canonical URLs');
}
if (!readSource('robots.txt').includes(`Sitemap: ${productionBase}/sitemap.xml`)) {
  fail('robots.txt must reference the production sitemap URL');
}

const notFound = readSource('404.html');
if (!/<meta\b[^>]*name="robots"[^>]*content="noindex,follow"/i.test(notFound) || /<link\b[^>]*\brel="canonical"/i.test(notFound)) {
  fail('404.html must be noindex and must not declare a canonical URL');
}

const index = readSource('index.html');
const headers = readSource('_headers');
const inlineScript = index.match(/<script>([\s\S]*?)<\/script>/);
if (!inlineScript) fail('Brevo inline configuration script was not found');
const inlineHash = `sha256-${createHash('sha256').update(inlineScript[1], 'utf8').digest('base64')}`;
if (!headers.includes(inlineHash)) fail('CSP hash does not match the current inline script in index.html');
for (const origin of ['https://sibforms.com', 'https://6d12f250.sibforms.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
  if (!headers.includes(origin)) fail(`CSP is missing a used integration origin: ${origin}`);
}
if (/\b(?:unsafe-inline|unsafe-eval|immutable)\b/i.test(headers)) {
  fail('CSP/cache policy contains a broad directive or long-lived immutable caching');
}
if (/^\s*Cache-Control\s*:/im.test(headers)) {
  fail('use Cloudflare Pages default revalidation cache headers; this project does not fingerprint asset names');
}

function resolveLocalReference(fromFile, rawUrl) {
  const url = rawUrl.trim();
  if (!url || url.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return null;
  const pagePath = fromFile.endsWith('.html')
    ? (fromFile === '404.html' ? '/__404__' : `/${fromFile === 'index.html' ? '' : fromFile.replace(/\.html$/, '')}`)
    : `/${fromFile}`;
  let resolved;
  try { resolved = new URL(url, `https://mimo-shop.pages.dev${pagePath}`); } catch { return `${fromFile}: malformed URL ${url}`; }
  if (resolved.origin !== productionBase) return null;
  let relative = decodeURIComponent(resolved.pathname).replace(/^\//, '');
  relative = routes.get(`/${relative}`) ?? relative;
  if (!relative && resolved.pathname === '/') relative = 'index.html';
  if (!path.extname(relative)) relative = routes.get(`/${relative}`) ?? `${relative}.html`;
  return files.includes(relative) ? null : `${fromFile}: missing ${url} (resolves to ${relative})`;
}

const referenceErrors = [];
for (const page of [...canonicalPages.keys(), '404.html']) {
  const html = readSource(page);
  for (const match of html.matchAll(/\b(?:src|href|action)=["']([^"']+)["']/gi)) {
    const error = resolveLocalReference(page, match[1]);
    if (error) referenceErrors.push(error);
  }
}
for (const cssFile of ['css/styles.css', 'css/tokens.css']) {
  const css = readSource(cssFile);
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const error = resolveLocalReference(cssFile, match[1]);
    if (error) referenceErrors.push(error);
  }
}
if (referenceErrors.length) fail(`broken local references: ${referenceErrors.join('; ')}`);

if (output !== path.join(root, 'public')) fail('refusing to clean an unexpected output directory');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const relativePath of files) {
  const destination = path.join(output, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, readFileSync(path.join(root, relativePath)));
}

const actualOutput = listFiles(output);
const expectedOutput = [...files].sort();
if (actualOutput.length !== expectedOutput.length || actualOutput.some((file, index) => file !== expectedOutput[index])) {
  fail('generated output does not match the publication allowlist');
}

console.log(`Built and validated ${files.length} allowlisted files into public/`);
