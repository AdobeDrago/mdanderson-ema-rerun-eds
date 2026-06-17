/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumb.
 * Base block: breadcrumb (new project block — no Block Collection example).
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Generated: 2026-06-17
 *
 * Content model (from blocks/breadcrumb/breadcrumb.js):
 *   Each row is one crumb. A link cell becomes a clickable crumb;
 *   a plain-text cell becomes the current page label.
 *
 * Source structure (validated against source.html):
 *   <section class="blog-breadcrumbs">
 *     <ul class="breadcrumbs" itemtype=".../BreadcrumbList">
 *       <li itemprop="itemListElement">         linked crumb
 *         <a href="..."><span itemprop="name">Get Screened</span></a>
 *       </li>
 *       <li itemprop="itemListElement">         current page (no <a>)
 *         <span itemprop="name">Mammograms & Breast Examination</span>
 *       </li>
 *     </ul>
 *   </section>
 */
export default function parse(element, { document }) {
  // Each <li> in the breadcrumb list is one crumb.
  const items = Array.from(element.querySelectorAll(
    'ul.breadcrumbs > li, ul.breadcrumb > li, li[itemprop="itemListElement"]',
  ));

  const cells = [];

  items.forEach((li) => {
    const link = li.querySelector('a[href]');
    if (link) {
      // Linked crumb: rebuild a clean anchor using the crumb label text.
      const labelSpan = link.querySelector('[itemprop="name"]');
      const label = (labelSpan ? labelSpan.textContent : link.textContent).trim();
      if (!label) return;
      const anchor = document.createElement('a');
      anchor.href = link.getAttribute('href');
      anchor.textContent = label;
      cells.push([anchor]);
    } else {
      // Current page crumb: plain text label, no link.
      const labelSpan = li.querySelector('[itemprop="name"]');
      const label = (labelSpan ? labelSpan.textContent : li.textContent).trim();
      if (!label) return;
      cells.push([label]);
    }
  });

  // Empty-block guard: nothing extractable, drop the block and keep raw content.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb', cells });
  element.replaceWith(block);
}
