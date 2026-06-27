/**
 * Lightweight CSV parser that handles quoted fields and CRLF/LF line endings.
 * Avoids any third-party dependencies.
 *
 * @param {string} text - Raw CSV string
 * @returns {string[][]} Parsed 2D array of cell values
 */
export function parseCSV(text) {
  const lines = [];
  let row = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        // Escaped quote inside quoted field
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }

  // Push the last row if it has content
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }

  // Filter out completely empty rows
  return lines.filter((r) => r.some((cell) => cell.trim() !== ''));
}
