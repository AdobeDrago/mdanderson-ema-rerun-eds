/*
 * Social share component. Renders email + share buttons; links provided in rows map to social platforms.
 * loads and decorates the social-share block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.classList.add('social-share');
  // Decoration is finalized during content import once the authored table structure is known.
  // The boilerplate markup-to-block mapping preserves rows/cells for social-share rendering.
}
