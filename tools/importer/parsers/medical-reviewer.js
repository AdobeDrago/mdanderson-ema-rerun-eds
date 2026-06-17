/* eslint-disable */
/* global WebImporter */
/**
 * Parser for medical-reviewer.
 * Base block: medical-reviewer (new project block, no Block Collection equivalent).
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Source selector: section.medical-reviewer-component
 * Generated: 2026-06-17
 *
 * Content model: structured attribution — reviewer name / credential / review date.
 *
 * NOTE: On the validated source page this component is EMPTY
 *   (<section class="medical-reviewer-component bleed-top bleed-bottom"></section>).
 * It is a reusable attribution component, so this parser is defensive: it extracts the
 * reviewer name, credential, and review date when present, and emits the block with an
 * empty placeholder cell when the section has no content (rather than bailing or crashing).
 */
export default function parse(element, { document }) {
  // Reviewer name — first heading or explicit reviewer-name node.
  const name = element.querySelector(
    'h1, h2, h3, h4, h5, h6, [class*="reviewer-name"], [class*="name"]',
  );

  // Credential(s) — explicit credential node, falling back to common patterns.
  const credential = element.querySelector(
    '[class*="credential"], [class*="title"], [class*="degree"]',
  );

  // Review date — explicit date node (class, <time>, or data attribute).
  const date = element.querySelector(
    '[class*="reviewed"], [class*="review-date"], [class*="date"], time, [datetime]',
  );

  // Build the single content cell from whatever structured pieces exist.
  const contentCell = [];
  if (name) contentCell.push(name);
  if (credential && credential !== name) contentCell.push(credential);
  if (date && date !== name && date !== credential) contentCell.push(date);

  // Empty-case fallback: if no structured pieces were found, fall back to any
  // remaining text/markup inside the section so authored content is not lost.
  if (contentCell.length === 0) {
    const leftover = element.textContent && element.textContent.trim();
    if (leftover) {
      contentCell.push(leftover);
    } else {
      // Truly empty component — emit an empty placeholder cell so the block is
      // still produced and can be authored/populated later.
      contentCell.push('');
    }
  }

  const cells = [contentCell];

  const block = WebImporter.Blocks.createBlock(document, { name: 'medical-reviewer', cells });
  element.replaceWith(block);
}
