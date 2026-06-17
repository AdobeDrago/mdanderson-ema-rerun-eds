/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-video
 * Base block: cards
 * Source: https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html
 * Selector: div.col-content div.media-player.media-single-small (matches multiple — one card per invocation)
 * Generated: 2026-06-17
 *
 * Each matched element is ONE right-rail video card. The parser produces a single
 * card row for the "cards" table: cell 1 = thumbnail image, cell 2 = caption + a
 * clickable/authorable YouTube watch link built from the video id.
 */
export default function parse(element, { document }) {
  // --- Thumbnail image (validated: .media-image picture img in source.html) ---
  const image = element.querySelector('.media-image img, picture img, img');

  // --- Caption text (validated: .carousel-body-text p; second .carousel-body-text is empty) ---
  let caption = null;
  const captionCandidates = element.querySelectorAll('.media-body-text .carousel-body-text p, .carousel-body-text p, .media-body-text p');
  for (const p of captionCandidates) {
    if (p.textContent && p.textContent.trim()) {
      caption = p;
      break;
    }
  }

  // --- Extract YouTube video id ---
  // Primary source: data-video-data JSON on .video-play-button (present on live source).
  // Fallback: id attribute on .display-video-content / [data-video-div] (cleaned DOM variants).
  let videoId = '';
  const playButton = element.querySelector('.video-play-button[data-video-data], [data-video-data]');
  if (playButton) {
    const raw = playButton.getAttribute('data-video-data');
    if (raw) {
      try {
        const data = JSON.parse(raw.replace(/&quot;/g, '"'));
        if (data && data.id) videoId = data.id;
      } catch (e) {
        const m = raw.match(/"id"\s*:\s*"([^"]+)"/);
        if (m) videoId = m[1];
      }
    }
  }
  if (!videoId) {
    const divRefEl = element.querySelector('.video-play-button[data-video-div], [data-video-div]');
    if (divRefEl) {
      const ref = divRefEl.getAttribute('data-video-div') || '';
      videoId = ref.replace(/^#/, '').trim();
    }
  }
  if (!videoId) {
    const displayEl = element.querySelector('.display-video-content[id], #basic-video-container [id]');
    if (displayEl && displayEl.id) videoId = displayEl.id.trim();
  }

  // Empty-block guard: nothing meaningful to author.
  if (!image && !caption && !videoId) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // --- Build the text cell: caption + authorable YouTube watch link ---
  const textCell = [];
  if (caption) textCell.push(caption);
  if (videoId) {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const link = document.createElement('a');
    link.href = watchUrl;
    link.title = 'Play Video';
    link.textContent = (caption && caption.textContent.trim()) ? caption.textContent.trim() : 'Watch video';
    textCell.push(link);
  }

  // --- Single card row: image cell + text cell ---
  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
