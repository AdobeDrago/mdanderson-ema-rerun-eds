/* eslint-disable */
/* global WebImporter */
/**
 * Parser for social-share.
 * Base block: social-share (new project block — no Block Collection example).
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Source selector: section.social-share-modal
 * Generated: 2026-06-17 (revalidated)
 *
 * The source markup is an interactive share widget: an email link and a share
 * trigger that opens a modal containing social-media share links (facebook,
 * twitter, linkedin, bluesky, threads) and a copy-link field. The interactive
 * behavior (modal open/close, copy-to-clipboard) is implemented in the block JS.
 *
 * For import we capture only the authorable intent: the share component, its
 * heading, and one row per share channel (label + link). Purely behavioral
 * markup (close button, copy field/button, decorative spacer/icons) is dropped.
 */
export default function parse(element, { document }) {
  // Heading shown in the share modal (authorable label for the widget).
  const headingEl = element.querySelector('.modal-header, [class*="modal-header"]');
  const headingText = headingEl ? headingEl.textContent.trim() : 'Share this article';

  // Collect the share channels. Each channel is a label + a share URL.
  // Email lives on the trigger row; social channels live inside the modal.
  const cells = [];
  cells.push([headingText]);

  // Email share link (mailto:). Use aria-label/id to label the channel.
  const emailLink = element.querySelector('a.email[href^="mailto:"], a#email-share[href^="mailto:"], a[href^="mailto:"]');
  if (emailLink) {
    const link = document.createElement('a');
    link.href = emailLink.getAttribute('href');
    link.textContent = 'Email';
    cells.push(['Email', link]);
  }

  // Social-media share links. Prefer the carousel/icon container, fall back to
  // any anchor that opens in a new tab inside the social-icons area.
  const socialLinks = Array.from(element.querySelectorAll(
    '.cw-social-links-carousel a[href], .social-icons a[href][target="_blank"]',
  ));
  socialLinks.forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    // Derive a readable label from aria-label, falling back to the id.
    let label = anchor.getAttribute('aria-label')
      || (anchor.id ? anchor.id.replace(/-share$/, '') : '');
    label = label.trim();
    if (!label) return;
    // Normalize capitalization (e.g. "linkedIn" -> "LinkedIn", "facebook" -> "Facebook").
    label = label.charAt(0).toUpperCase() + label.slice(1);
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    cells.push([label, link]);
  });

  // Empty-block guard: if no share channels were found, unwrap and bail.
  if (cells.length <= 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'social-share', cells });
  element.replaceWith(block);
}
