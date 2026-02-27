/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Columns block
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: columns
 *
 * Block Structure (from markdown example):
 * - Row 1: Block name header ("Columns")
 * - Row 2: Column headings [col1 | col2 | col3 | col4]
 * - Row 3-N: Links per column [link1 | link2 | link3 | link4]
 *
 * Source HTML Pattern:
 * <div class="Grid-grid-{hash} Grid-md:grid-cols-4-{hash}">
 *   <div class="GridItem-order-{hash}">
 *     <p class="body02 font-medium">Column Heading</p>
 *     <a href="..."><p class="body03 font-demi">Link Text</p></a>
 *     <a href="..."><p class="body03 font-demi">Link Text</p></a>
 *     ...
 *   </div>
 *   <!-- 3 more column divs -->
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // EXTRACTED: Found direct child divs with GridItem-order class
  const columnDivs = element.querySelectorAll(':scope > div[class*="GridItem-order"]');

  if (columnDivs.length === 0) return;

  // Parse each column into arrays of content
  const columns = [];
  let maxRows = 0;

  columnDivs.forEach((colDiv) => {
    const columnContent = [];

    // Extract column heading
    // EXTRACTED: Found <p class="mb-12 body02 font-medium">Home & family tax tips</p>
    const heading = colDiv.querySelector('p[class*="body02"][class*="font-medium"]');
    if (heading) {
      const strong = document.createElement('strong');
      strong.textContent = heading.textContent.trim();
      columnContent.push(strong);
    }

    // Extract links
    // EXTRACTED: Found <a class="Link-font-demi-link-84adaca mb-4"><p class="body03 font-demi">Family</p></a>
    const links = colDiv.querySelectorAll('a[class*="Link-font-demi-link"]');
    links.forEach((link) => {
      const a = link.cloneNode(true);
      a.textContent = link.textContent.trim();
      columnContent.push(a);
    });

    columns.push(columnContent);
    if (columnContent.length > maxRows) {
      maxRows = columnContent.length;
    }
  });

  // Build cells array: each row has one cell per column
  const cells = [];

  // Row 1: Column headings (first element from each column)
  const headingRow = columns.map((col) => (col.length > 0 ? col[0] : ''));
  cells.push(headingRow);

  // Remaining rows: links
  for (let i = 1; i < maxRows; i++) {
    const row = columns.map((col) => (col.length > i ? col[i] : ''));
    cells.push(row);
  }

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
