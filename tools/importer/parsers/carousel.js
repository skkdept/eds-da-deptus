/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Carousel block
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: carousel
 *
 * Block Structure (from markdown example):
 * - Row 1: Block name header ("Carousel")
 * - Row 2-N: [image | title link] per slide
 *
 * Source HTML Pattern:
 * <div class="glide">
 *   <div class="glide__track">
 *     <ul class="glide__slides">
 *       <li class="glide__slide">
 *         <div>
 *           <picture><img src="..." alt=""></picture>
 *           <a href="..."><p>Article Title</p></a>
 *         </div>
 *       </li>
 *     </ul>
 *   </div>
 *   <div class="navigation__container">...</div>
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // EXTRACTED: Found <li class="glide__slide CarouselItem-glide__slide-73cee54">
  const slides = element.querySelectorAll('.glide__slide, li[class*="glide__slide"]');

  const cells = [];

  slides.forEach((slide) => {
    // Extract image
    // EXTRACTED: Found <img class="mb-20 mx-auto rounded-xx_large" src="./images/...">
    const img = slide.querySelector('img');

    // Extract title link
    // EXTRACTED: Found <a class="Link-font-demi-link-84adaca" href="..."><p class="body02 font-demi">Title</p></a>
    const link = slide.querySelector('a[class*="Link-font-demi-link"], a[href*="/tax-tips/"]');

    if (img && link) {
      const a = link.cloneNode(true);
      // Clean link text - use inner text content
      a.textContent = link.textContent.trim();

      cells.push([img.cloneNode(true), a]);
    } else if (img) {
      // Fallback: image without link
      cells.push([img.cloneNode(true), '']);
    }
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
