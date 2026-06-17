import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toClassName,
  toCamelCase,
} from './aem.js';

/**
 * Applies section-metadata blocks as section classes / data attributes.
 * This repo's aem.js does not process section-metadata in decorateSections,
 * so we handle it here after sections are decorated.
 * @param {Element} main The main element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll('.section div.section-metadata').forEach((sectionMeta) => {
    const section = sectionMeta.closest('.section');
    if (!section) return;
    const meta = readBlockConfig(sectionMeta);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') {
        meta.style
          .split(',')
          .filter((style) => style)
          .map((style) => toClassName(style.trim()))
          .forEach((style) => section.classList.add(style));
      } else {
        section.dataset[toCamelCase(key)] = meta[key];
      }
    });
    sectionMeta.parentNode.remove();
  });
}

/**
 * Restructures the flat block-wrappers of the two-column body section into the
 * intended layout: a narrow ToC sidebar on the left, and a right column whose
 * article prose and right rail form a nested two-column, with full-width items
 * (Featured Articles) below. EDS flattens all blocks into sibling wrappers, so
 * we group them here into stable containers the CSS can lay out.
 * @param {Element} main The main element
 */
function decorateTwoColumnBody(main) {
  const section = main.querySelector('.section.two-column');
  if (!section || section.dataset.twoColDecorated) return;
  section.dataset.twoColDecorated = 'true';

  const wrappers = [...section.children].filter((c) => c.classList.contains('page-nav-wrapper')
    || c.matches('[class$="-wrapper"]') || c.classList.contains('default-content-wrapper'));
  if (!wrappers.length) return;

  const toc = section.querySelector('.page-nav-wrapper');
  // Rail blocks that sit to the right of the article prose.
  const railSelectors = ['cards-promo-wrapper', 'cards-video-wrapper', 'cards-teaser-wrapper', 'podcast-wrapper'];
  // Full-width blocks that drop below the article + rail.
  const fullWidthSelectors = ['cards-article-wrapper'];

  const doc = main.ownerDocument;
  const content = doc.createElement('div');
  content.className = 'two-column-content';
  const article = doc.createElement('div');
  article.className = 'two-column-article';
  const rail = doc.createElement('div');
  rail.className = 'two-column-rail';
  const full = doc.createElement('div');
  full.className = 'two-column-full';

  wrappers.forEach((w) => {
    if (w === toc) return;
    const cls = [...w.classList].find((c) => c.endsWith('-wrapper')) || '';
    if (railSelectors.includes(cls)) rail.append(w);
    else if (fullWidthSelectors.includes(cls)) full.append(w);
    else article.append(w);
  });

  const inner = doc.createElement('div');
  inner.className = 'two-column-inner';
  if (article.children.length) inner.append(article);
  if (rail.children.length) inner.append(rail);
  if (inner.children.length) content.append(inner);
  if (full.children.length) content.append(full);

  // Rebuild: [ToC][content] inside the section's first wrapper region.
  if (toc) section.prepend(toc);
  section.append(content);
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateTwoColumnBody(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
