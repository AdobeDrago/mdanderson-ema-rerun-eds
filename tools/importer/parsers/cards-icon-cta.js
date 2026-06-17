/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon-cta.
 * Base block: cards.
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Selector (page-templates.json instances[]): div.pre-footer div.promo.promo-with-background
 *
 * These are the "Help #EndCancer" CTA cards in the pre-footer. The selector matches each
 * promo card individually, so this parser is invoked once per promo. To produce a single
 * "cards" block containing every promo as a row, we find the shared ancestor container
 * (the 3-column table that holds all promos), collect every promo card beneath it, build the
 * combined block on the FIRST promo's invocation, and remove the other promo cards so the
 * parser is effectively a no-op for them.
 *
 * NOTE: In the real page DOM each promo is wrapped in its own `div.module.m-bleed` inside a
 * `div.cell-t`, so the promos are NOT direct DOM siblings. We therefore locate the closest
 * shared container (`.table-3col`, the highlight section, or the pre-footer) and query all
 * promo cards within it rather than relying on direct-sibling adjacency.
 *
 * Each card is a "no images / no icon" promo, so we use the single text-column cards format:
 * one cell per card containing heading + body + CTA link (matching library-example.md
 * "Cards (no images)" variant). The text cell preserves the source heading, body, and CTA
 * link as semantic HTML.
 */
export default function parse(element, { document }) {
  // Validated against cleaned.html: each card is <div class="promo ... promo-with-background ...">.
  const cardSelector = 'div.promo.promo-with-background';

  // Find the shared container that wraps the whole group of promo cards.
  // Validated against cleaned.html hierarchy: section.highlight > div.table.table-3col > div.cell-t > div.module > div.promo.
  const container = element.closest('div.table, section.highlight, div.pre-footer')
    || element.parentElement
    || element;

  // Collect all promo cards in this group, in document order.
  let cards = Array.from(container.querySelectorAll(cardSelector));
  if (!cards.length) {
    cards = [element];
  }

  // Only the FIRST card builds the combined block. For any later card, the first card's
  // invocation has already (or will) absorb it — remove it so we don't emit duplicates.
  if (cards[0] !== element) {
    element.remove();
    return;
  }

  const cells = [];
  cards.forEach((card) => {
    // Heading: h3.title (with fallbacks for heading-level variation).
    const heading = card.querySelector('.promo-header h2, .promo-header h3, .promo-header h4, h2, h3, h4, [class*="title"]');
    // Body: div.body (with fallbacks). Validated: <div class="body promo-text-normal">.
    const body = card.querySelector('.promo-text .body, .body, [class*="body"]');
    // CTA link: a.cta (with fallbacks). Validated: <a class="cta cta-block" ...>.
    const ctaLinks = Array.from(card.querySelectorAll('.cta-wrapper a, a.cta, a.cta-block, a[class*="cta"]'));

    const textCell = [];
    if (heading) textCell.push(heading);
    if (body) textCell.push(body);
    ctaLinks.forEach((cta) => textCell.push(cta));

    if (textCell.length) {
      // "Cards (no images)" variant: single text column per card row.
      cells.push([textCell]);
    }
  });

  // Empty-block guard: if no usable card content was found, unwrap gracefully.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Remove the trailing promo cards we just absorbed so they aren't parsed again.
  cards.forEach((card) => {
    if (card !== element) card.remove();
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-cta', cells });
  element.replaceWith(block);
}
