/**
 * Page Nav (table of contents)
 * Auto-builds a jump-to list from the headings in the page's main content.
 * Authoring: place an empty `page-nav` block (optionally row 1 = a label like "On this page").
 */

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function decorate(block) {
  // Optional label from the first authored row; default "On this page".
  const labelText = block.textContent.trim() || 'On this page';
  block.textContent = '';

  const label = document.createElement('div');
  label.className = 'page-nav-label';
  label.textContent = labelText;

  const list = document.createElement('ul');
  list.className = 'page-nav-list';

  // Collect headings from the main content, excluding this block and the right rail.
  const main = block.closest('main') || document;
  const headings = main.querySelectorAll('h2[id], h3[id]');

  headings.forEach((h) => {
    // Skip headings that live inside blocks (rail cards, podcast, etc.) — ToC tracks article sections only.
    if (h.closest('.page-nav')) return;
    if (h.closest('.cards, .featured-articles, .featured-podcasts, .schedule-cta, .podcast, .cards-promo, .cards-video, .cards-teaser, .cards-article, .cards-icon-cta')) return;

    let id = h.id;
    if (!id) {
      id = slugify(h.textContent);
      h.id = id;
    }
    const li = document.createElement('li');
    li.className = 'page-nav-item';
    if (h.tagName === 'H3') li.classList.add('page-nav-sub');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = h.textContent.trim();
    a.addEventListener('click', (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    });
    li.append(a);
    list.append(li);
  });

  if (!list.children.length) {
    // Nothing to link — remove the block so it doesn't render an empty rail.
    block.remove();
    return;
  }

  block.append(label, list);
}
