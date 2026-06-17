/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mdanderson section breaks + section metadata (sections).
 *
 * Runs in afterTransform only. Reads payload.template.sections and, for the
 * screening-detail-page template, inserts an <hr> before every non-first
 * section and a Section Metadata block (with the section's style) after each
 * section. This preserves the three distinct page sections through markdown:
 *
 *   rc3  Breadcrumb                              style: light
 *   rc5  Body - two-column article + right rail  style: two-column
 *   rc6  Pre-footer - appointment band + cards   style: light
 *
 * Section selectors come from page-templates.json (resolved from captured DOM
 * in migration-work/cleaned.html). The breadcrumb is a top-level child of the
 * importer main element (cleaned.html:1275); the body and pre-footer live under
 * div#skip (cleaned.html:1317 -> :1319 div.content.sidebar-parent, :1964
 * div.pre-footer). The selectors are normalized so they resolve relative to the
 * importer `element` regardless of whether a `body >` / `#skip >` prefix is used
 * in the template.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

/**
 * Resolve a section's first element within the importer root using its
 * template selector. Falls back to a prefix-stripped selector because the
 * importer operates on the extracted `main` element, where `body >` / `#skip >`
 * combinators may no longer match the (re-rooted) tree.
 */
function findSectionElement(root, selector) {
  if (!selector) return null;
  let el = null;
  try {
    el = root.querySelector(selector);
  } catch (e) {
    el = null;
  }
  if (el) return el;

  // Strip a leading "body >" / "#skip >" style combinator and retry with the
  // descendant selector (e.g. "#skip > div.pre-footer" -> "div.pre-footer").
  const stripped = selector.replace(/^[^>]*>\s*/, '').trim();
  if (stripped && stripped !== selector) {
    try {
      el = root.querySelector(stripped);
    } catch (e) {
      el = null;
    }
  }
  return el;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload
      && payload.template
      && Array.isArray(payload.template.sections)
      ? payload.template.sections
      : [];

    if (sections.length < 2) return;

    const doc = element.ownerDocument || document;

    // Process in reverse order so inserting nodes does not shift the
    // positions of sections we have not handled yet.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section.selector);
      if (!sectionEl) continue;

      // Section Metadata block (after the section) when the section has a style.
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
        }
      }

      // Section break before every section except the first.
      if (i > 0 && sectionEl.parentNode) {
        sectionEl.parentNode.insertBefore(doc.createElement('hr'), sectionEl);
      }
    }
  }
}
