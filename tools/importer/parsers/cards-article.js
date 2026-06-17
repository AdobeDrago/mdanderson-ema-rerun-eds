/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-article.
 * Base block: cards
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Instance selector: div.fis-articles
 * Generated: 2026-06-17
 *
 * Full-width "Featured Articles" section: an h2 section heading followed by a
 * list of article cards. Each card in the source is an <a class="blog-summary">
 * wrapping a thumbnail image (.blog-summary-img-wrapper picture/img) and a title
 * (h3.blog-title). The third card is hidden by default (style="display:none") and
 * a "View more"/"View less" toggle controls visibility — that behavior is handled
 * in the block JS, so all cards are imported regardless of inline display state.
 *
 * Output (cards table): each card row = [image cell, text cell]. The text cell holds
 * the article title rendered as a link to the article (preserving the card href).
 * The "Featured Articles" heading is emitted as default content immediately before
 * the block so it reads as the section heading.
 */
export default function parse(element, { document }) {
  // Section heading ("Featured Articles").
  const heading = element.querySelector('.fis-articles-title, h2, h1, h3, [class*="title"]');

  // Article cards: each is an anchor wrapping image + title.
  const cardEls = Array.from(
    element.querySelectorAll('a.blog-summary, a[class*="blog-summary"]'),
  );

  // Empty-block guard: bail gracefully if no cards were found.
  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    // Card thumbnail image.
    const img = card.querySelector('.blog-summary-img-wrapper img, picture img, img');

    // Card title heading.
    const title = card.querySelector('.blog-title, h3, h2, [class*="title"]');

    // Build a linked title so the card title navigates to the article.
    const textCell = [];
    const href = card.getAttribute('href');
    if (title) {
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = title.textContent.trim();
        // Keep the heading semantics by wrapping the link in the title's tag.
        const titleHeading = document.createElement(title.tagName.toLowerCase());
        titleHeading.append(link);
        textCell.push(titleHeading);
      } else {
        textCell.push(title);
      }
    } else if (href) {
      // No explicit title — fall back to a bare link.
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = href;
      textCell.push(link);
    }

    // One card row: [image cell, text cell]. Include image cell only when present.
    const cardRow = [];
    if (img) cardRow.push(img);
    cardRow.push(textCell);

    cells.push(cardRow);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });

  // Emit the "Featured Articles" heading as default content before the block.
  if (heading) {
    element.replaceWith(heading, block);
  } else {
    element.replaceWith(block);
  }
}
