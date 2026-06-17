/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbParser from './parsers/breadcrumb.js';
import socialShareParser from './parsers/social-share.js';
import medicalReviewerParser from './parsers/medical-reviewer.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsVideoParser from './parsers/cards-video.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import podcastParser from './parsers/podcast.js';
import cardsArticleParser from './parsers/cards-article.js';
import appointmentBarParser from './parsers/appointment-bar.js';
import cardsIconCtaParser from './parsers/cards-icon-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/mdanderson-cleanup.js';
import sectionsTransformer from './transformers/mdanderson-sections.js';

// PARSER REGISTRY
const parsers = {
  breadcrumb: breadcrumbParser,
  'social-share': socialShareParser,
  'medical-reviewer': medicalReviewerParser,
  'cards-promo': cardsPromoParser,
  'cards-video': cardsVideoParser,
  'cards-teaser': cardsTeaserParser,
  podcast: podcastParser,
  'cards-article': cardsArticleParser,
  'appointment-bar': appointmentBarParser,
  'cards-icon-cta': cardsIconCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'screening-detail-page',
  description: 'Prevention & screening detail page: black utility top bar, red megamenu nav, breadcrumb, two-column body (long-form left content + right rail with appointment CTA, videos, featured articles), pre-footer (appointment + Help #EndCancer), and global footer.',
  urls: [
    'https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html',
  ],
  blocks: [
    { name: 'breadcrumb', instances: ['div.col-content-single.breadcrumb-wrapper section.blog-breadcrumbs', 'section.blog-breadcrumbs'] },
    { name: 'social-share', instances: ['section.social-share-modal'] },
    { name: 'medical-reviewer', instances: ['section.medical-reviewer-component'] },
    { name: 'cards-promo', instances: ['div.col-content div.promo.promo-simple.promo-icon-red'] },
    { name: 'cards-video', instances: ['div.col-content div.media-player.media-single-small'] },
    { name: 'cards-teaser', instances: ['div.col-content div.blog-summary.small:not(.fis)'] },
    { name: 'podcast', instances: ['section.podcast-component'] },
    { name: 'cards-article', instances: ['div.fis-articles'] },
    { name: 'appointment-bar', instances: ['div.pre-footer section.appt-section div.appointment-bar'] },
    { name: 'cards-icon-cta', instances: ['div.pre-footer div.promo.promo-with-background'] },
  ],
  sections: [
    {
      id: 'rc3',
      name: 'Breadcrumb',
      selector: 'body > div.col-content-single.breadcrumb-wrapper',
      style: 'light',
      blocks: ['breadcrumb'],
      defaultContent: [],
    },
    {
      id: 'rc5',
      name: 'Body - two-column article + right rail',
      selector: '#skip > div.content.sidebar-parent',
      style: 'two-column',
      blocks: ['social-share', 'medical-reviewer', 'cards-promo', 'cards-video', 'cards-teaser', 'podcast', 'cards-article'],
      defaultContent: ['div.col-content div.cell-l'],
    },
    {
      id: 'rc6',
      name: 'Pre-footer - appointment band + Help #EndCancer',
      selector: '#skip > div.pre-footer',
      style: 'light',
      blocks: ['appointment-bar', 'cards-icon-cta'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, sections last (afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all block instances on the page based on the embedded template.
 * @param {Document} document
 * @param {Object} template
 * @returns {Array} block instances
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already detached by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
