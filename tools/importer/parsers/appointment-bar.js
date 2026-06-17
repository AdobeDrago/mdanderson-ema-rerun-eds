/* eslint-disable */
/* global WebImporter */
/**
 * Parser for appointment-bar.
 * Base block: appointment-bar
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Selector: div.pre-footer section.appt-section div.appointment-bar
 * Generated: 2026-06-17
 *
 * Full-bleed colored appointment band. Captures the message text
 * ("We're here for you. Call us at ... or request an appointment online."),
 * the phone tel: link, and the appointment CTA link in a single content cell.
 */
export default function parse(element, { document }) {
  // The active message lives inside .during-hours. A sibling .after-hours div may exist
  // but is hidden — we intentionally only capture the during-hours message.
  // Fallbacks: the block's inner wrapper, then the block element itself.
  let message = element.querySelector('.during-hours');
  if (!message) {
    message = element.querySelector('.appointment-bar-wrapper') || element;
  }

  // The message text + links are typically wrapped in a single inner <span>.
  // Descend into it so we capture the message content rather than the wrapper.
  let contentSource = message;
  const children = Array.from(message.children);
  if (children.length === 1 && children[0].tagName === 'SPAN') {
    contentSource = children[0];
  }

  // Validate there is real content (text and/or links) before emitting a block.
  const hasLink = !!contentSource.querySelector('a[href]');
  const hasText = (contentSource.textContent || '').trim().length > 0;
  if (!hasLink && !hasText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve the inner message markup (text, tel: link, appointment link) as a single cell.
  // Collect the child nodes so plain text, <span class="bold">, <span class="tel"> with the
  // tel: link, <br>, and the appointment <a> are all retained in order.
  const content = Array.from(contentSource.childNodes);

  const cells = [
    content.length ? content : [contentSource],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'appointment-bar', cells });
  element.replaceWith(block);
}
