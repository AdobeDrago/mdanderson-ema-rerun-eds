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

  // Track heading/list-item pairs so we can highlight the active section on scroll.
  const tracked = [];

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
    tracked.push({ heading: h, item: li, link: a });
  });

  if (!list.children.length) {
    // Nothing to link — remove the block so it doesn't render an empty rail.
    block.remove();
    return;
  }

  block.append(label, list);

  // Scroll-spy: highlight the section currently in view (matches the source's red active state).
  const setActive = (item) => {
    tracked.forEach((t) => {
      const on = t.item === item;
      t.item.classList.toggle('is-active', on);
      if (on) t.link.setAttribute('aria-current', 'true');
      else t.link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      // Pick the topmost heading still in/above the viewport.
      let current = tracked[0];
      tracked.forEach((t) => {
        if (t.heading.getBoundingClientRect().top <= 120) current = t;
      });
      if (visible.size) {
        // Prefer the first visible heading when one is on screen.
        const firstVisible = tracked.find((t) => visible.has(t.heading));
        if (firstVisible) current = firstVisible;
      }
      setActive(current ? current.item : null);
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

    tracked.forEach((t) => observer.observe(t.heading));
    setActive(tracked[0].item);
  }
}
