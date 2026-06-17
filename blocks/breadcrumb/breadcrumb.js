/*
 * Breadcrumb trail. Each row is one crumb; a link cell becomes a clickable crumb, a plain-text cell becomes the current page.
 * loads and decorates the breadcrumb block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.classList.add('breadcrumb');
  // Decoration is finalized during content import once the authored table structure is known.
  // The boilerplate markup-to-block mapping preserves rows/cells for breadcrumb rendering.
}
