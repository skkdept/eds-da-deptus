/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Cards block
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: cards
 *
 * Block Structure (from markdown example):
 * - Row 1: Block name header ("Cards")
 * - Row 2-N: [image | content] per card
 *
 * Source HTML Patterns:
 * 1. Featured cards: div[class*="Pod-pod"] with image, category(h2), title(h4), description(p), CTA(a)
 * 2. Recent/Blog cards: Grid-cols-5 items with image, category-link(a>h4), title-link(a>p)
 * 3. Author cards: Grid-cols-4 items with avatar, name(span), role(p), CTA(a)
 * 4. Tool cards: Grid-cols-3 items with icon, title(h4), description(p), CTA(a)
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // Identify card items within the container
  // VALIDATED: Source HTML uses different container patterns for different card types
  let cardItems;

  // Pattern 1: Featured cards (Pod-based layout)
  // EXTRACTED: Found <div class="Pod-pod-{hash}"> in source HTML (hash varies across builds)
  const pods = element.querySelectorAll('[class*="Pod-pod"]');
  if (pods.length > 0) {
    cardItems = Array.from(pods);
  }

  // Pattern 2: Grid-based cards (recent, blog, authors, tools)
  // EXTRACTED: Found <div class="... GridItem-order-e422a5a ..."> in source HTML
  if (!cardItems || cardItems.length === 0) {
    const gridItems = element.querySelectorAll('[class*="GridItem-order"]');
    if (gridItems.length > 0) {
      cardItems = Array.from(gridItems);
    }
  }

  // Fallback: direct children divs that contain images
  if (!cardItems || cardItems.length === 0) {
    cardItems = Array.from(element.querySelectorAll(':scope > div')).filter(
      (div) => div.querySelector('img'),
    );
  }

  const cells = [];

  cardItems.forEach((card) => {
    // Extract image
    // VALIDATED: All card types use <picture><img> pattern
    const img = card.querySelector('img');

    // Build content cell - extract all text/link content
    const contentContainer = document.createElement('div');

    // Extract category/label (various patterns)
    // EXTRACTED: Featured has <h2 class="body03 font-medium text-pepper80">
    // EXTRACTED: Recent/Blog has <a><h4 class="body03 font-medium text-pepper80">
    // EXTRACTED: Authors has <span class="headline06 font-medium text-black">
    const categoryLink = card.querySelector('a[class*="Link-font-demi-link"] h4');
    const categoryHeading = card.querySelector('h2.body03, h2[class*="body03"]');
    const authorName = card.querySelector('span[class*="headline06"]');

    if (categoryLink) {
      // Recent/Blog pattern: category is a linked heading
      const p = document.createElement('p');
      const a = categoryLink.closest('a').cloneNode(true);
      const strong = document.createElement('strong');
      strong.textContent = categoryLink.textContent.trim();
      a.textContent = '';
      a.appendChild(strong);
      p.appendChild(a);
      contentContainer.appendChild(p);
    } else if (categoryHeading) {
      // Featured pattern: plain category label
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = categoryHeading.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    } else if (authorName) {
      // Author pattern: name as strong text
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = authorName.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    }

    // Extract title (various patterns)
    // EXTRACTED: Featured has <h4 class="headline06 font-medium">
    // EXTRACTED: Recent/Blog has second <a><p class="body02 font-demi text-blueberry80">
    // EXTRACTED: Tools has <h4 class="headline06 font-medium">
    const titleH4 = card.querySelector('h4[class*="headline06"]');
    const titleLink = card.querySelectorAll('a[class*="Link-font-demi-link"]');

    if (titleH4 && !categoryLink) {
      // Featured/Tools pattern: h4 title (not linked category)
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = titleH4.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    }

    // For Recent/Blog: the second link is the title link
    if (categoryLink && titleLink.length > 1) {
      const titleA = titleLink[1];
      const p = document.createElement('p');
      const a = titleA.cloneNode(true);
      // Ensure link text is clean
      a.textContent = a.textContent.trim();
      p.appendChild(a);
      contentContainer.appendChild(p);
    } else if (!categoryLink && !authorName) {
      // For blog cards without linked categories but with title links
      const links = card.querySelectorAll('a[class*="Link-font-demi-link"]');
      if (links.length > 0 && !titleH4) {
        const p = document.createElement('p');
        const a = links[0].cloneNode(true);
        a.textContent = a.textContent.trim();
        p.appendChild(a);
        contentContainer.appendChild(p);
      }
    }

    // Extract description (if present)
    // EXTRACTED: Featured has <p class="pb-16 body03 font-regular">
    // EXTRACTED: Tools has <p class="mb-20 body03 font-regular">
    // EXTRACTED: Authors has <p class="text-secondary">
    const descParagraphs = card.querySelectorAll('p[class*="body03"][class*="font-regular"]');
    const authorRole = card.querySelector('p[class*="text-secondary"]');
    if (descParagraphs.length > 0) {
      descParagraphs.forEach((desc) => {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        contentContainer.appendChild(p);
      });
    } else if (authorRole) {
      const p = document.createElement('p');
      p.textContent = authorRole.textContent.trim();
      contentContainer.appendChild(p);
    }

    // Extract CTA links (bottom links)
    // EXTRACTED: Featured has <a><p class="body02 font-text-weight-inherit">Read full article</p></a>
    // EXTRACTED: Authors has <a><p class="body02 font-demi">More about...</p></a>
    // EXTRACTED: Tools has <a><p class="body03 font-text-weight-inherit">Get started</p></a>
    const ctaLinks = card.querySelectorAll('a[class*="Link-font-demi-link"]');
    const lastLink = ctaLinks.length > 0 ? ctaLinks[ctaLinks.length - 1] : null;

    // Only add CTA if it's different from the title link we already captured
    if (lastLink && !categoryLink) {
      // For featured/author/tool cards, the last link is the CTA
      // Check if we haven't already added this link content
      const ctaText = lastLink.textContent.trim();
      if (ctaText && !contentContainer.textContent.includes(ctaText)) {
        const p = document.createElement('p');
        const a = lastLink.cloneNode(true);
        a.textContent = ctaText;
        p.appendChild(a);
        contentContainer.appendChild(p);
      }
    }

    // Build the row: [image, content]
    if (img) {
      cells.push([img.cloneNode(true), contentContainer]);
    }
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
