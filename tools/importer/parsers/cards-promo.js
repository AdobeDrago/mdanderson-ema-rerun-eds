/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo.
 * Base block: cards
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Instance selector: div.col-content div.promo.promo-simple.promo-icon-red
 * Generated: 2026-06-17
 *
 * Single self-contained promo/CTA card. Cell 1 = icon, Cell 2 = heading + body + CTA.
 * The promo uses a Font Awesome style font-icon (span.fa-stack) rather than an <img>,
 * so the icon element itself is placed in the image/icon cell.
 */
export default function parse(element, { document }) {
  // Icon: font-icon wrapper (no <img> in source). Fall back to any image if present.
  const icon = element.querySelector('.promo-icon, [class*="icon-circle"], img');

  // Heading: card title.
  const heading = element.querySelector('.promo-header h3, .promo-header h2, h1, h2, h3, [class*="title"]');

  // Body: paragraph content (phone number etc.).
  const body = element.querySelector('.promo-text .body, .promo-text, [class*="body"]');

  // CTA link(s): "Set your appointment" -> external link.
  const ctaLinks = Array.from(element.querySelectorAll('.cta-wrapper a, a.cta, a[class*="cta"]'));

  // Empty-block guard: bail gracefully if nothing meaningful was found.
  if (!heading && !body && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Text cell: heading + body + optional CTA(s).
  const textCell = [];
  if (heading) textCell.push(heading);
  if (body) textCell.push(body);
  textCell.push(...ctaLinks);

  // One card row: [icon cell, text cell]. Include icon cell only when present.
  const cardRow = [];
  if (icon) cardRow.push(icon);
  cardRow.push(textCell);

  const cells = [cardRow];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
