/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-teaser
 * Base block: cards
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Selector: div.col-content div.blog-summary.small:not(.fis) (matches multiple — one card per invocation)
 * Generated: 2026-06-17
 *
 * Note: each matched .blog-summary.small (excluding .fis Featured Articles) is one
 * teaser; the parser emits a single card row per invocation.
 * Each matched element is ONE right-rail featured-article teaser card. The parser
 * produces a single card row for the "cards" table:
 *   cell 1 = thumbnail image (.blog-summary-img-wrapper img)
 *   cell 2 = linked title (h3) + summary text + "Read more" CTA link
 * The two teasers on the page are matched separately, so each invocation yields
 * one card row.
 */
export default function parse(element, { document }) {
  // --- Thumbnail image (validated: .blog-summary-img-wrapper picture img in source.html) ---
  const image = element.querySelector('.blog-summary-img-wrapper img, picture img, img');

  // --- Article URL: the wrapping anchor links the image + title (validated in source.html) ---
  const titleAnchor = element.querySelector('a[href]');
  const articleHref = titleAnchor ? titleAnchor.getAttribute('href') : '';

  // --- Title heading (validated: .blog-summary-wrapper.title h3.blog-title) ---
  const title = element.querySelector('.blog-summary-wrapper.title h3, h3.blog-title, h3');
  const titleText = title && title.textContent ? title.textContent.trim() : '';

  // --- Summary text (validated: .summary-text) ---
  const summary = element.querySelector('.summary-text, .blog-summary-wrapper.text .summary-text');
  const summaryText = summary && summary.textContent ? summary.textContent.trim() : '';

  // --- "Read more" CTA (validated: a.cta in .summary-cta-info) ---
  const ctaSource = element.querySelector('.summary-cta-info a.cta, a.cta');

  // Empty-block guard: nothing meaningful to author.
  if (!image && !titleText && !summaryText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Build the text cell: linked title heading + summary + Read more CTA ---
  const textCell = [];

  // Linked title: rebuild an h3 wrapping an anchor so the title remains a heading + link.
  if (titleText) {
    const heading = document.createElement('h3');
    if (articleHref) {
      const titleLink = document.createElement('a');
      titleLink.href = articleHref;
      titleLink.textContent = titleText;
      heading.appendChild(titleLink);
    } else {
      heading.textContent = titleText;
    }
    textCell.push(heading);
  }

  // Summary paragraph.
  if (summaryText) {
    const p = document.createElement('p');
    p.textContent = summaryText;
    textCell.push(p);
  }

  // "Read more" CTA — strip trailing icon, keep clean link text.
  if (ctaSource) {
    const cta = document.createElement('a');
    cta.href = ctaSource.getAttribute('href') || articleHref || '';
    const ctaText = (ctaSource.textContent || '').replace(/\s+/g, ' ').trim();
    cta.textContent = ctaText || 'Read more';
    textCell.push(cta);
  } else if (articleHref) {
    // Fallback CTA if the explicit "Read more" link is absent.
    const cta = document.createElement('a');
    cta.href = articleHref;
    cta.textContent = 'Read more';
    textCell.push(cta);
  }

  // --- Single card row: image cell + text cell ---
  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
