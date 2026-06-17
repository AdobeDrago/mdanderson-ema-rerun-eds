/*
 * Full-width appointment band. Renders a phone number and a Request an appointment CTA across a colored full-bleed bar.
 * loads and decorates the appointment-bar block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.classList.add('appointment-bar');
  // Decoration is finalized during content import once the authored table structure is known.
  // The boilerplate markup-to-block mapping preserves rows/cells for appointment-bar rendering.
}
