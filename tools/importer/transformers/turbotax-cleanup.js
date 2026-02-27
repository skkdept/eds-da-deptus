/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for TurboTax website cleanup
 * Purpose: Remove non-content elements (header, footer, nav, skip links, modals)
 * Applies to: turbotax.intuit.com (all templates)
 * Generated: 2026-02-27
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration of https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * - cleaned.html from page scraping phase
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header/navigation
    // EXTRACTED: Found <header class="w-full Header-header-ef98178 sticky top-0 z-30">
    WebImporter.DOMUtils.remove(element, [
      'header.Header-header-ef98178',
      'header',
    ]);

    // Remove skip-to-content link
    // EXTRACTED: Found <a href="#mainContent" class="Header-skipLink-7ad2311">
    WebImporter.DOMUtils.remove(element, [
      'a.Header-skipLink-7ad2311',
      'a[href="#mainContent"]',
    ]);

    // Remove navigation containers
    // EXTRACTED: Found <nav class="Nav-navContainer-7029c27 Nav-dropdownNavContainer-232cbaf">
    WebImporter.DOMUtils.remove(element, [
      'nav.Nav-navContainer-7029c27',
      'nav',
    ]);

    // Remove carousel navigation elements (glide arrows, bullets)
    // EXTRACTED: Found <div class="navigation__container index-navigation__container-5d4c7a0">
    // These are interactive carousel controls, not content
    WebImporter.DOMUtils.remove(element, [
      '.navigation__container',
      '.glide__arrowContainer',
      '.glide__bulletsContainer',
    ]);

    // Remove breadcrumb (handled as default content in migration, not imported as block)
    // EXTRACTED: Found <div class="mb-16 font-medium body03"> containing breadcrumb links
    // This will be recreated as default content, not parsed from source
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining non-content elements
    // Standard HTML elements safe to remove post-parsing
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
      'source',
    ]);

    // Remove footer elements if present
    // EXTRACTED: Footer is typically loaded dynamically on TurboTax pages
    WebImporter.DOMUtils.remove(element, [
      'footer',
      '[class*="Footer"]',
    ]);

    // Clean up data attributes used for tracking
    // EXTRACTED: Found data-theme="turbotax" and various data-* attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('data-theme');
      el.removeAttribute('data-track');
      el.removeAttribute('data-testid');
    });
  }
}
