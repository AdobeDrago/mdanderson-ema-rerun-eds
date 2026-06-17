/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: podcast
 * Base block: podcast
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Selector: section.podcast-component
 * Generated: 2026-06-17
 *
 * Target table structure (per scaffolded blocks/podcast):
 *   Row 0: block name ("podcast")
 *   Row 1 (optional): branded wave header image
 *   Row 2..N: one row per podcast entry => [title, "View podcast episode page" link, "Read transcript" link]
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against source.html)
  // Branded wave header image lives in .top-side-multiple (fallback: first img in block)
  const headerImage = element.querySelector('.top-side-multiple img, .podcast-container img, img');

  // Each podcast entry is a wrapper div (.podcastOne/.podcastTwo/.podcastThree),
  // interleaved with .podcast-spacer separators inside .podcast-display-item /
  // .podcast-items. Each wrapper carries a .podcast-title plus the two CTAs.
  // Strategy: find every .podcast-title, then climb to its nearest ancestor wrapper
  // that contains the entry's CTAs. This is resilient to varying nesting depth across
  // pages (the cross-page selector union may differ from the cached snapshot).
  const titles = Array.from(element.querySelectorAll('.podcast-title'));
  const entries = [];
  const seen = new Set();

  titles.forEach((title) => {
    // Climb to the closest ancestor that also contains a podcast CTA (the entry wrapper).
    let wrapper = title.parentElement;
    while (
      wrapper
      && wrapper !== element
      && !wrapper.querySelector('.podcast-cta a, .podcast-transcript-cta a, a[aria-label*="episode" i], a[aria-label*="transcript" i]')
    ) {
      wrapper = wrapper.parentElement;
    }
    // Fall back to the title's immediate parent, then the title itself.
    const entry = wrapper && wrapper !== element ? wrapper : (title.parentElement || title);
    if (!seen.has(entry)) {
      seen.add(entry);
      entries.push({ entry, title });
    }
  });

  // Final fallback: if no titles were found, treat each CTA pair container as an entry.
  if (entries.length === 0) {
    Array.from(element.querySelectorAll('.podcast-cta a')).forEach((a) => {
      const wrapper = a.closest('div') || a;
      if (!seen.has(wrapper)) {
        seen.add(wrapper);
        entries.push({ entry: wrapper, title: null });
      }
    });
  }

  const cells = [];

  // Row 1: header image (optional)
  if (headerImage) {
    cells.push([headerImage]);
  }

  // One row per podcast entry => [title, episode link, transcript link]
  entries.forEach(({ entry, title }) => {
    // Episode page CTA ("View podcast episode page")
    const episodeLink = entry.querySelector(
      '.podcast-cta a, a[aria-label*="episode" i], a[href*="podcast"]',
    );

    // Transcript CTA ("Read transcript")
    const transcriptLink = entry.querySelector(
      '.podcast-transcript-cta a, a[aria-label*="transcript" i], a[href*="transcript"]',
    );

    const rowCell = [];
    if (title) rowCell.push(title);
    if (episodeLink) rowCell.push(episodeLink);
    if (transcriptLink && transcriptLink !== episodeLink) rowCell.push(transcriptLink);

    if (rowCell.length > 0) {
      cells.push(rowCell);
    }
  });

  // Empty-block guard: if no header image and no entries, unwrap gracefully
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'podcast', cells });
  element.replaceWith(block);
}
