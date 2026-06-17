/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-screening-detail-page.js
  var import_screening_detail_page_exports = {};
  __export(import_screening_detail_page_exports, {
    default: () => import_screening_detail_page_default
  });

  // tools/importer/parsers/breadcrumb.js
  function parse(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(
      'ul.breadcrumbs > li, ul.breadcrumb > li, li[itemprop="itemListElement"]'
    ));
    const cells = [];
    items.forEach((li) => {
      const link = li.querySelector("a[href]");
      if (link) {
        const labelSpan = link.querySelector('[itemprop="name"]');
        const label = (labelSpan ? labelSpan.textContent : link.textContent).trim();
        if (!label) return;
        const anchor = document2.createElement("a");
        anchor.href = link.getAttribute("href");
        anchor.textContent = label;
        cells.push([anchor]);
      } else {
        const labelSpan = li.querySelector('[itemprop="name"]');
        const label = (labelSpan ? labelSpan.textContent : li.textContent).trim();
        if (!label) return;
        cells.push([label]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "breadcrumb", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/social-share.js
  function parse2(element, { document: document2 }) {
    const headingEl = element.querySelector('.modal-header, [class*="modal-header"]');
    const headingText = headingEl ? headingEl.textContent.trim() : "Share this article";
    const cells = [];
    cells.push([headingText]);
    const emailLink = element.querySelector('a.email[href^="mailto:"], a#email-share[href^="mailto:"], a[href^="mailto:"]');
    if (emailLink) {
      const link = document2.createElement("a");
      link.href = emailLink.getAttribute("href");
      link.textContent = "Email";
      cells.push(["Email", link]);
    }
    const socialLinks = Array.from(element.querySelectorAll(
      '.cw-social-links-carousel a[href], .social-icons a[href][target="_blank"]'
    ));
    socialLinks.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      let label = anchor.getAttribute("aria-label") || (anchor.id ? anchor.id.replace(/-share$/, "") : "");
      label = label.trim();
      if (!label) return;
      label = label.charAt(0).toUpperCase() + label.slice(1);
      const link = document2.createElement("a");
      link.href = href;
      link.textContent = label;
      cells.push([label, link]);
    });
    if (cells.length <= 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "social-share", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/medical-reviewer.js
  function parse3(element, { document: document2 }) {
    const name = element.querySelector(
      'h1, h2, h3, h4, h5, h6, [class*="reviewer-name"], [class*="name"]'
    );
    const credential = element.querySelector(
      '[class*="credential"], [class*="title"], [class*="degree"]'
    );
    const date = element.querySelector(
      '[class*="reviewed"], [class*="review-date"], [class*="date"], time, [datetime]'
    );
    const contentCell = [];
    if (name) contentCell.push(name);
    if (credential && credential !== name) contentCell.push(credential);
    if (date && date !== name && date !== credential) contentCell.push(date);
    if (contentCell.length === 0) {
      const leftover = element.textContent && element.textContent.trim();
      if (leftover) {
        contentCell.push(leftover);
      } else {
        contentCell.push("");
      }
    }
    const cells = [contentCell];
    const block = WebImporter.Blocks.createBlock(document2, { name: "medical-reviewer", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse4(element, { document: document2 }) {
    const icon = element.querySelector('.promo-icon, [class*="icon-circle"], img');
    const heading = element.querySelector('.promo-header h3, .promo-header h2, h1, h2, h3, [class*="title"]');
    const body = element.querySelector('.promo-text .body, .promo-text, [class*="body"]');
    const ctaLinks = Array.from(element.querySelectorAll('.cta-wrapper a, a.cta, a[class*="cta"]'));
    if (!heading && !body && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (heading) textCell.push(heading);
    if (body) textCell.push(body);
    textCell.push(...ctaLinks);
    const cardRow = [];
    if (icon) cardRow.push(icon);
    cardRow.push(textCell);
    const cells = [cardRow];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  function parse5(element, { document: document2 }) {
    const image = element.querySelector(".media-image img, picture img, img");
    let caption = null;
    const captionCandidates = element.querySelectorAll(".media-body-text .carousel-body-text p, .carousel-body-text p, .media-body-text p");
    for (const p of captionCandidates) {
      if (p.textContent && p.textContent.trim()) {
        caption = p;
        break;
      }
    }
    let videoId = "";
    const playButton = element.querySelector(".video-play-button[data-video-data], [data-video-data]");
    if (playButton) {
      const raw = playButton.getAttribute("data-video-data");
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
      const divRefEl = element.querySelector(".video-play-button[data-video-div], [data-video-div]");
      if (divRefEl) {
        const ref = divRefEl.getAttribute("data-video-div") || "";
        videoId = ref.replace(/^#/, "").trim();
      }
    }
    if (!videoId) {
      const displayEl = element.querySelector(".display-video-content[id], #basic-video-container [id]");
      if (displayEl && displayEl.id) videoId = displayEl.id.trim();
    }
    if (!image && !caption && !videoId) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (caption) textCell.push(caption);
    if (videoId) {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const link = document2.createElement("a");
      link.href = watchUrl;
      link.title = "Play Video";
      link.textContent = caption && caption.textContent.trim() ? caption.textContent.trim() : "Watch video";
      textCell.push(link);
    }
    const cells = [[image || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function parse6(element, { document: document2 }) {
    const image = element.querySelector(".blog-summary-img-wrapper img, picture img, img");
    const titleAnchor = element.querySelector("a[href]");
    const articleHref = titleAnchor ? titleAnchor.getAttribute("href") : "";
    const title = element.querySelector(".blog-summary-wrapper.title h3, h3.blog-title, h3");
    const titleText = title && title.textContent ? title.textContent.trim() : "";
    const summary = element.querySelector(".summary-text, .blog-summary-wrapper.text .summary-text");
    const summaryText = summary && summary.textContent ? summary.textContent.trim() : "";
    const ctaSource = element.querySelector(".summary-cta-info a.cta, a.cta");
    if (!image && !titleText && !summaryText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (titleText) {
      const heading = document2.createElement("h3");
      if (articleHref) {
        const titleLink = document2.createElement("a");
        titleLink.href = articleHref;
        titleLink.textContent = titleText;
        heading.appendChild(titleLink);
      } else {
        heading.textContent = titleText;
      }
      textCell.push(heading);
    }
    if (summaryText) {
      const p = document2.createElement("p");
      p.textContent = summaryText;
      textCell.push(p);
    }
    if (ctaSource) {
      const cta = document2.createElement("a");
      cta.href = ctaSource.getAttribute("href") || articleHref || "";
      const ctaText = (ctaSource.textContent || "").replace(/\s+/g, " ").trim();
      cta.textContent = ctaText || "Read more";
      textCell.push(cta);
    } else if (articleHref) {
      const cta = document2.createElement("a");
      cta.href = articleHref;
      cta.textContent = "Read more";
      textCell.push(cta);
    }
    const cells = [[image || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/podcast.js
  function parse7(element, { document: document2 }) {
    const headerImage = element.querySelector(".top-side-multiple img, .podcast-container img, img");
    const titles = Array.from(element.querySelectorAll(".podcast-title"));
    const entries = [];
    const seen = /* @__PURE__ */ new Set();
    titles.forEach((title) => {
      let wrapper = title.parentElement;
      while (wrapper && wrapper !== element && !wrapper.querySelector('.podcast-cta a, .podcast-transcript-cta a, a[aria-label*="episode" i], a[aria-label*="transcript" i]')) {
        wrapper = wrapper.parentElement;
      }
      const entry = wrapper && wrapper !== element ? wrapper : title.parentElement || title;
      if (!seen.has(entry)) {
        seen.add(entry);
        entries.push({ entry, title });
      }
    });
    if (entries.length === 0) {
      Array.from(element.querySelectorAll(".podcast-cta a")).forEach((a) => {
        const wrapper = a.closest("div") || a;
        if (!seen.has(wrapper)) {
          seen.add(wrapper);
          entries.push({ entry: wrapper, title: null });
        }
      });
    }
    const cells = [];
    if (headerImage) {
      cells.push([headerImage]);
    }
    entries.forEach(({ entry, title }) => {
      const episodeLink = entry.querySelector(
        '.podcast-cta a, a[aria-label*="episode" i], a[href*="podcast"]'
      );
      const transcriptLink = entry.querySelector(
        '.podcast-transcript-cta a, a[aria-label*="transcript" i], a[href*="transcript"]'
      );
      const rowCell = [];
      if (title) rowCell.push(title);
      if (episodeLink) rowCell.push(episodeLink);
      if (transcriptLink && transcriptLink !== episodeLink) rowCell.push(transcriptLink);
      if (rowCell.length > 0) {
        cells.push(rowCell);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "podcast", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse8(element, { document: document2 }) {
    const heading = element.querySelector('.fis-articles-title, h2, h1, h3, [class*="title"]');
    const cardEls = Array.from(
      element.querySelectorAll('a.blog-summary, a[class*="blog-summary"]')
    );
    if (cardEls.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector(".blog-summary-img-wrapper img, picture img, img");
      const title = card.querySelector('.blog-title, h3, h2, [class*="title"]');
      const textCell = [];
      const href = card.getAttribute("href");
      if (title) {
        if (href) {
          const link = document2.createElement("a");
          link.setAttribute("href", href);
          link.textContent = title.textContent.trim();
          const titleHeading = document2.createElement(title.tagName.toLowerCase());
          titleHeading.append(link);
          textCell.push(titleHeading);
        } else {
          textCell.push(title);
        }
      } else if (href) {
        const link = document2.createElement("a");
        link.setAttribute("href", href);
        link.textContent = href;
        textCell.push(link);
      }
      const cardRow = [];
      if (img) cardRow.push(img);
      cardRow.push(textCell);
      cells.push(cardRow);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    if (heading) {
      element.replaceWith(heading, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/appointment-bar.js
  function parse9(element, { document: document2 }) {
    let message = element.querySelector(".during-hours");
    if (!message) {
      message = element.querySelector(".appointment-bar-wrapper") || element;
    }
    let contentSource = message;
    const children = Array.from(message.children);
    if (children.length === 1 && children[0].tagName === "SPAN") {
      contentSource = children[0];
    }
    const hasLink = !!contentSource.querySelector("a[href]");
    const hasText = (contentSource.textContent || "").trim().length > 0;
    if (!hasLink && !hasText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const content = Array.from(contentSource.childNodes);
    const cells = [
      content.length ? content : [contentSource]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "appointment-bar", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-cta.js
  function parse10(element, { document: document2 }) {
    const cardSelector = "div.promo.promo-with-background";
    const container = element.closest("div.table, section.highlight, div.pre-footer") || element.parentElement || element;
    let cards = Array.from(container.querySelectorAll(cardSelector));
    if (!cards.length) {
      cards = [element];
    }
    if (cards[0] !== element) {
      element.remove();
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const heading = card.querySelector('.promo-header h2, .promo-header h3, .promo-header h4, h2, h3, h4, [class*="title"]');
      const body = card.querySelector('.promo-text .body, .body, [class*="body"]');
      const ctaLinks = Array.from(card.querySelectorAll('.cta-wrapper a, a.cta, a.cta-block, a[class*="cta"]'));
      const textCell = [];
      if (heading) textCell.push(heading);
      if (body) textCell.push(body);
      ctaLinks.forEach((cta) => textCell.push(cta));
      if (textCell.length) {
        cells.push([textCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cards.forEach((card) => {
      if (card !== element) card.remove();
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/mdanderson-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#video-overlay",
        // cleaned.html:1305 media overlay dialog
        "#yt-overlay",
        // cleaned.html:1311 youtube overlay dialog
        "a.scrollToTop"
        // cleaned.html:1298 "Go To Top" floating widget
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header (auto-loaded boilerplate / separate nav fragment)
        "header.mda-nav",
        // cleaned.html:3 black utility bar
        "nav.mda-nav",
        // cleaned.html:167 red primary megamenu
        // Global footer (auto-loaded boilerplate / separate footer fragment)
        "section.global-footer.bleed-full",
        // cleaned.html:2098
        // Jump-menu sidebar (in-page nav chrome, not authorable)
        "div.col-sidebar",
        // cleaned.html:1321
        // Chat / guide placeholder
        "#guide",
        // cleaned.html:2096 empty Loyal Chatbot placeholder
        // Leftover overlay shells (in case any survived block parsing)
        "#video-overlay",
        "#yt-overlay",
        "a.scrollToTop",
        // Tracking / loader / non-content elements
        "iframe",
        // Adform tracking pixel (end of file) + media tracking iframes
        "script",
        "style",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/mdanderson-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function findSectionElement(root, selector) {
    if (!selector) return null;
    let el = null;
    try {
      el = root.querySelector(selector);
    } catch (e) {
      el = null;
    }
    if (el) return el;
    const stripped = selector.replace(/^[^>]*>\s*/, "").trim();
    if (stripped && stripped !== selector) {
      try {
        el = root.querySelector(stripped);
      } catch (e) {
        el = null;
      }
    }
    return el;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && Array.isArray(payload.template.sections) ? payload.template.sections : [];
      if (sections.length < 2) return;
      const doc = element.ownerDocument || document;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = findSectionElement(element, section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (sectionEl.parentNode) {
            sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
          }
        }
        if (i > 0 && sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(doc.createElement("hr"), sectionEl);
        }
      }
    }
  }

  // tools/importer/import-screening-detail-page.js
  var parsers = {
    breadcrumb: parse,
    "social-share": parse2,
    "medical-reviewer": parse3,
    "cards-promo": parse4,
    "cards-video": parse5,
    "cards-teaser": parse6,
    podcast: parse7,
    "cards-article": parse8,
    "appointment-bar": parse9,
    "cards-icon-cta": parse10
  };
  var PAGE_TEMPLATE = {
    name: "screening-detail-page",
    description: "Prevention & screening detail page: black utility top bar, red megamenu nav, breadcrumb, two-column body (long-form left content + right rail with appointment CTA, videos, featured articles), pre-footer (appointment + Help #EndCancer), and global footer.",
    urls: [
      "https://www.mdanderson.org/prevention-screening/get-screened/breast-cancer-screening.html"
    ],
    blocks: [
      { name: "breadcrumb", instances: ["div.col-content-single.breadcrumb-wrapper section.blog-breadcrumbs", "section.blog-breadcrumbs"] },
      { name: "social-share", instances: ["section.social-share-modal"] },
      { name: "medical-reviewer", instances: ["section.medical-reviewer-component"] },
      { name: "cards-promo", instances: ["div.col-content div.promo.promo-simple.promo-icon-red"] },
      { name: "cards-video", instances: ["div.col-content div.media-player.media-single-small"] },
      { name: "cards-teaser", instances: ["div.col-content div.blog-summary.small:not(.fis)"] },
      { name: "podcast", instances: ["section.podcast-component"] },
      { name: "cards-article", instances: ["div.fis-articles"] },
      { name: "appointment-bar", instances: ["div.pre-footer section.appt-section div.appointment-bar"] },
      { name: "cards-icon-cta", instances: ["div.pre-footer div.promo.promo-with-background"] }
    ],
    sections: [
      {
        id: "rc3",
        name: "Breadcrumb",
        selector: "body > div.col-content-single.breadcrumb-wrapper",
        style: "light",
        blocks: ["breadcrumb"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "Body - two-column article + right rail",
        selector: "#skip > div.content.sidebar-parent",
        style: "two-column",
        blocks: ["social-share", "medical-reviewer", "cards-promo", "cards-video", "cards-teaser", "podcast", "cards-article"],
        defaultContent: ["div.col-content div.cell-l"]
      },
      {
        id: "rc6",
        name: "Pre-footer - appointment band + Help #EndCancer",
        selector: "#skip > div.pre-footer",
        style: "light",
        blocks: ["appointment-bar", "cards-icon-cta"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_screening_detail_page_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_screening_detail_page_exports);
})();
