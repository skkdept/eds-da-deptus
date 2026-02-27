/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Tabs block
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: tabs
 *
 * Block Structure (from markdown example):
 * - Row 1: Block name header ("Tabs")
 * - Row 2-N: [tab label | tab content] per tab
 *
 * Source HTML Pattern:
 * <div class="idsTSTabs">
 *   <div class="Tabs-tabsList-19d25b3">
 *     <button id="idsTab-{id}" class="Tabs-tabButton-49b612f">
 *       <div><span><strong>TAB LABEL</strong></span></div>
 *     </button>
 *   </div>
 *   <div id="idsTab-{id}-tabPanel" class="Tabs-tabPanel-073f769">
 *     <h2>Heading</h2>
 *     <a href="..."><p>Link text</p></a>
 *     <div><iframe src="youtube-url"></iframe></div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // EXTRACTED: Found <div class="Tabs-tabsList-19d25b3"> containing tab buttons
  const tabButtons = element.querySelectorAll('.Tabs-tabButton-49b612f, button[class*="Tabs-tabButton"]');

  // EXTRACTED: Found <div class="Tabs-tabPanel-073f769"> for each tab's content
  const tabPanels = element.querySelectorAll('.Tabs-tabPanel-073f769, div[class*="Tabs-tabPanel"]');

  const cells = [];

  tabButtons.forEach((button, index) => {
    // Extract tab label
    // EXTRACTED: Found <strong class="Typography-medium-d5186b7">TAB LABEL</strong>
    const strong = button.querySelector('strong');
    let labelText = strong ? strong.textContent.trim() : button.textContent.trim();

    // Normalize label from ALL CAPS to Title Case
    if (labelText === labelText.toUpperCase()) {
      labelText = labelText
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Get corresponding panel
    const panel = tabPanels[index];
    if (!panel) return;

    // Build tab content
    const contentContainer = document.createElement('div');

    // Extract heading
    // EXTRACTED: Found <h2 class="headline03 font-regular">
    const heading = panel.querySelector('h2, h3');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      contentContainer.appendChild(h3);
    }

    // Extract browse link
    // EXTRACTED: Found <a href="https://youtube.com/turbotax"><p>Browse all tax videos</p></a>
    const browseLink = panel.querySelector('a[href*="youtube"]');
    if (browseLink) {
      const p = document.createElement('p');
      const a = browseLink.cloneNode(true);
      a.textContent = browseLink.textContent.trim();
      p.appendChild(a);
      contentContainer.appendChild(p);
    }

    // Extract YouTube embed
    // EXTRACTED: Found <iframe src="https://www.youtube.com/embed/?playlist=...">
    const iframe = panel.querySelector('iframe[src*="youtube"]');
    if (iframe) {
      const src = iframe.getAttribute('src') || '';
      // Extract first video ID from playlist parameter
      const playlistMatch = src.match(/playlist=([^&,]+)/);
      if (playlistMatch) {
        const videoId = playlistMatch[1];
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = videoUrl;
        a.textContent = videoUrl;
        p.appendChild(a);
        contentContainer.appendChild(p);
      }
    }

    cells.push([labelText, contentContainer]);
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Tabs', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
