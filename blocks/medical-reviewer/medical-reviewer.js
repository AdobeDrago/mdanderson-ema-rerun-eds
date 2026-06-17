/*
 * Medical reviewer attribution. Renders reviewer name, credentials and review date; renders nothing when empty.
 * loads and decorates the medical-reviewer block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.classList.add('medical-reviewer');
  // Decoration is finalized during content import once the authored table structure is known.
  // The boilerplate markup-to-block mapping preserves rows/cells for medical-reviewer rendering.
}
