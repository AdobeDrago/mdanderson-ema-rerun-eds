import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeAllPanels(megamenu) {
  megamenu.querySelectorAll('.mda-nav-item[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

function decorateUtilityBar(section) {
  section.classList.add('mda-utility-bar');
  const list = section.querySelector('ul');
  if (list) list.classList.add('mda-utility-list');
  // Items with a nested <ul> are dropdowns
  section.querySelectorAll(':scope ul > li').forEach((li) => {
    if (li.querySelector('ul')) {
      li.classList.add('mda-has-dropdown');
      const trigger = li.querySelector(':scope > a');
      if (trigger) {
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const open = trigger.getAttribute('aria-expanded') === 'true';
          li.closest('ul').querySelectorAll('[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
          trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
        });
      }
    }
  });
}

function decorateBrandRow(section) {
  section.classList.add('mda-brand-row');
  const brandLink = section.querySelector('p a');
  if (brandLink) brandLink.classList.add('mda-brand-logo');
  const list = section.querySelector('ul');
  if (list) list.classList.add('mda-secondary-list');

  // Language dropdown (item with nested ul)
  section.querySelectorAll(':scope ul > li').forEach((li) => {
    if (li.querySelector('ul')) {
      li.classList.add('mda-has-dropdown');
      const trigger = li.querySelector(':scope > a');
      if (trigger) {
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const open = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
        });
      }
    }
  });

  // Build the search form (not allowed in the plain fragment)
  const search = document.createElement('div');
  search.className = 'mda-search';
  search.innerHTML = `
    <form role="search" action="https://www.mdanderson.org/search.html" method="get">
      <input type="search" name="q" placeholder="Search" aria-label="Search" />
      <button type="submit" aria-label="Submit search"><span class="mda-search-icon"></span></button>
    </form>`;
  section.append(search);
}

function decorateMegamenu(section) {
  section.classList.add('mda-megamenu');
  const topList = section.querySelector(':scope > ul');
  if (topList) topList.classList.add('mda-megamenu-list');

  section.querySelectorAll(':scope > ul > li').forEach((li) => {
    li.classList.add('mda-nav-item');
    const panel = li.querySelector(':scope > ul');
    const trigger = li.querySelector(':scope > a');
    if (panel) {
      li.classList.add('mda-has-panel');
      panel.classList.add('mda-nav-panel');
      li.setAttribute('aria-expanded', 'false');
      if (trigger) trigger.setAttribute('aria-haspopup', 'true');

      // Hover opens/closes on desktop
      li.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          closeAllPanels(section);
          li.setAttribute('aria-expanded', 'true');
        }
      });
      li.addEventListener('mouseleave', () => {
        if (isDesktop.matches) li.setAttribute('aria-expanded', 'false');
      });

      // Click toggles the panel (and follows link on second behavior layer)
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          if (isDesktop.matches) {
            // first click opens panel rather than navigating
            const open = li.getAttribute('aria-expanded') === 'true';
            if (!open) {
              e.preventDefault();
              closeAllPanels(section);
              li.setAttribute('aria-expanded', 'true');
            }
          } else {
            // mobile: toggle accordion
            e.preventDefault();
            const open = li.getAttribute('aria-expanded') === 'true';
            li.setAttribute('aria-expanded', open ? 'false' : 'true');
          }
        });
      }
    }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Load nav fragment: localhost serves /content/nav.plain.html; DA/EDS uses {navPath}.plain.html
  let fragment;
  try {
    const resp = await fetch('/content/nav.plain.html');
    if (resp.ok) {
      const html = await resp.text();
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      fragment = tmp.querySelector('main') || tmp;
    }
  } catch (e) { /* fall through to loadFragment */ }
  if (!fragment) {
    fragment = await loadFragment('/nav');
  }

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Three sections: [0]=utility CTA bar, [1]=brand+secondary+search, [2]=primary megamenu
  const sections = nav.querySelectorAll(':scope > div');
  if (sections[0]) decorateUtilityBar(sections[0]);
  if (sections[1]) decorateBrandRow(sections[1]);
  if (sections[2]) decorateMegamenu(sections[2]);

  // Hamburger for mobile
  const hamburger = document.createElement('button');
  hamburger.className = 'mda-nav-hamburger';
  hamburger.setAttribute('type', 'button');
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="mda-nav-hamburger-icon"></span>';
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', open ? 'false' : 'true');
    hamburger.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('mda-nav-open', !open);
    document.body.style.overflowY = (!open && !isDesktop.matches) ? 'hidden' : '';
  });

  // Close panels and reset mobile menu when crossing breakpoints
  isDesktop.addEventListener('change', () => {
    const megamenu = nav.querySelector('.mda-megamenu');
    if (megamenu) closeAllPanels(megamenu);
    nav.classList.remove('mda-nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
  });

  // Close desktop panels on outside click / escape
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      const megamenu = nav.querySelector('.mda-megamenu');
      if (megamenu) closeAllPanels(megamenu);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      const megamenu = nav.querySelector('.mda-megamenu');
      if (megamenu) closeAllPanels(megamenu);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(hamburger, nav);
  block.append(navWrapper);
}
