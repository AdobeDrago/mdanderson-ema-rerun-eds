import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Fetch the footer fragment raw (like the header) so the `footer` block
  // table's cell structure is preserved. loadFragment runs decorateSections,
  // which merges the multi-cell columns row into a single wrapper — fetching
  // raw keeps the four authored columns intact.
  let fragment;
  // Local dev serves the doc under /content/...; the published site serves it
  // at the root. Try the right path first per environment to avoid a 404.
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const candidates = isLocal
    ? ['/content/footer.plain.html', '/footer.plain.html']
    : ['/footer.plain.html', '/content/footer.plain.html'];
  for (let i = 0; i < candidates.length && !fragment; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(candidates[i]);
      if (resp.ok) {
        // eslint-disable-next-line no-await-in-loop
        const html = await resp.text();
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        fragment = tmp.querySelector('main') || tmp;
      }
    } catch (e) { /* try next */ }
  }
  if (!fragment) {
    fragment = await loadFragment('/footer');
  }
  if (!fragment) return;

  block.textContent = '';
  const footer = document.createElement('div');
  // NOTE: do not use class "footer" here — styles.css hides `footer .footer`
  // until it has data-block-status="loaded" (a FOUC guard for the block itself).
  // This inner container never gets that attribute, so a "footer" class would
  // leave it permanently visibility:hidden. Use a distinct class.
  footer.className = 'footer-content';

  // The `footer` block has rows = regions; each row's first cell holds content.
  const footerBlock = fragment.querySelector('.footer') || fragment;
  const rows = [...footerBlock.children].filter((el) => el.tagName === 'DIV');
  const rowClasses = ['footer-subscribe', 'footer-columns', 'footer-legal', 'footer-mission'];

  rows.forEach((row, i) => {
    const region = document.createElement('div');
    if (rowClasses[i]) region.classList.add(rowClasses[i]);

    if (rowClasses[i] === 'footer-columns') {
      // Each cell <div> in this row is one footer column.
      [...row.children].filter((c) => c.tagName === 'DIV').forEach((cell) => {
        const col = document.createElement('div');
        col.className = 'footer-column';
        while (cell.firstChild) col.append(cell.firstChild);
        region.append(col);
      });
    } else {
      // Single-cell rows: unwrap the cell so its content sits directly in region.
      const cell = row.querySelector(':scope > div') || row;
      while (cell.firstChild) region.append(cell.firstChild);
    }
    footer.append(region);
  });

  block.append(footer);
}
