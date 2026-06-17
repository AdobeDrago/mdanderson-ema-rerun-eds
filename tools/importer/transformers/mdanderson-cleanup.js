/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mdanderson site-wide cleanup (cleanup).
 *
 * Removes non-authorable chrome so the imported document contains only the page
 * body (breadcrumb, two-column article + right rail, pre-footer). The header and
 * global footer are auto-loaded boilerplate blocks (handled as separate nav/footer
 * fragments) and must not appear in the imported body.
 *
 * Every selector below was verified against migration-work/cleaned.html.
 *
 * HEADER (verified cleaned.html:3, :167):
 *   <header class="mda-nav"> ... black utility bar
 *   <nav class="mda-nav">    ... red primary megamenu
 * GLOBAL FOOTER (verified cleaned.html:2098):
 *   <section class="global-footer bleed-full"> ... <footer>
 * JUMP-MENU SIDEBAR (verified cleaned.html:1321):
 *   <div class="col-sidebar"> ... in-page "Jump To" nav, not authorable
 * CHROME / OVERLAYS / TRACKING (verified cleaned.html):
 *   #video-overlay, #yt-overlay (:1305, :1311) floating media dialogs
 *   a.scrollToTop (:1298) "Go To Top" widget
 *   #guide (:2096) empty chat/guide placeholder ("Loyal Chatbot" SSI :1294)
 *   <iframe> Adform tracking pixel (after </main>, end of file)
 *   <script> clientlib loaders (:2485, :2489)
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Floating dialogs / overlays that could interfere with block parsing.
    // Selectors verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      '#video-overlay', // cleaned.html:1305 media overlay dialog
      '#yt-overlay', // cleaned.html:1311 youtube overlay dialog
      'a.scrollToTop', // cleaned.html:1298 "Go To Top" floating widget
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. Selectors verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      // Header (auto-loaded boilerplate / separate nav fragment)
      'header.mda-nav', // cleaned.html:3 black utility bar
      'nav.mda-nav', // cleaned.html:167 red primary megamenu
      // Global footer (auto-loaded boilerplate / separate footer fragment)
      'section.global-footer.bleed-full', // cleaned.html:2098
      // Jump-menu sidebar (in-page nav chrome, not authorable)
      'div.col-sidebar', // cleaned.html:1321
      // Chat / guide placeholder
      '#guide', // cleaned.html:2096 empty Loyal Chatbot placeholder
      // Leftover overlay shells (in case any survived block parsing)
      '#video-overlay',
      '#yt-overlay',
      'a.scrollToTop',
      // Tracking / loader / non-content elements
      'iframe', // Adform tracking pixel (end of file) + media tracking iframes
      'script',
      'style',
      'noscript',
      'link',
    ]);
  }
}
