/*
 * Podcast component. First row optional header image; each subsequent row = one podcast (title + listen link + transcript link).
 * loads and decorates the podcast block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.classList.add('podcast');
  // Decoration is finalized during content import once the authored table structure is known.
  // The boilerplate markup-to-block mapping preserves rows/cells for podcast rendering.
}
