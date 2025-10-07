// backend/utils/ocrTradeExtractor.js

import Tesseract from 'tesseract.js';

async function extractTradeFromImage(buffer) {
  try {
    const { data: { text } } = await Tesseract.recognize(
      buffer,
      'eng',
      {
        logger: m => console.log(m),
      }
    );

    let cleanText = text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Raw OCR Text:', cleanText);

    // 1. Quantity (keep sign for side inference) — improved regex
    const qtyMatch = cleanText.match(/(-\s*\d+(?:,\d{3})*\.?\d*|\d+(?:,\d{3})*\.?\d*)\s*SHARES/i);
    const qtyRaw = qtyMatch ? qtyMatch[1].replace(/\s/g, '') : null;
    const qty = qtyRaw ? parseFloat(qtyRaw.replace(/,/g, '')) : null;

    console.log('Extracted Qty Raw:', qtyRaw, 'Parsed Qty:', qty);

    // 2. Entry (AVG)
    const avgMatch = cleanText.match(/AVG\s*([\d,]+\.\d+)/i);
    const entry = avgMatch ? parseFloat(avgMatch[1].replace(/,/g, '')) : null;

    // 3. Exit — fuzzy match for "LTP", "17P", etc.
    const exitMatch = cleanText.match(/([L1I7][T7]\s*P|LTP|17P)\s*([\d,]+\.\d+)/i);
    const exit = exitMatch ? parseFloat(exitMatch[2].replace(/,/g, '')) : null;

    // 4. Symbol
    let symbol = null;
    if (qtyMatch) {
      const afterQty = cleanText.slice(qtyMatch.index + qtyMatch[0].length).trim();
      const symbolMatch = afterQty.match(/([A-Z]{3,})/);
      if (symbolMatch) symbol = symbolMatch[1];
    }
    if (!symbol) {
      const words = cleanText.split(/\s+/);
      for (let word of words) {
        if (word.length >= 3 && /^[A-Z]+$/.test(word) && !['NIFTY', 'BANKNIFTY'].includes(word)) {
          symbol = word;
          break;
        }
      }
    }

    // 5. Infer side from original (signed) qty — with fallback
    let side = 'BUY'; // default

    if (qty !== null && qty < 0) {
      side = 'SELL';
    } else if (qty !== null && qty > 0 && entry && exit && exit < entry) {
      // Fallback: if exit price < entry price and qty > 0 → likely a short position
      side = 'SELL';
    }

    console.log('Inferred Side:', side, 'Qty:', qty, 'Entry:', entry, 'Exit:', exit); // 👈 DEBUG

    // Return trade with POSITIVE quantity (for UI)
    const trade = {
      symbol,
      qty: qty !== null ? Math.abs(qty) : null,
      entry,
      exit,
      side,
      timestamp: new Date().toISOString(),
    };

    if (!trade.symbol || trade.qty === null || !trade.entry || !trade.exit) {
      throw new Error('Missing critical fields: symbol, qty, entry, exit');
    }

    return trade;
  } catch (error) {
    console.error('OCR Extraction Failed:', error.message);
    throw new Error('Failed to extract trade details. Please upload a clear screenshot.');
  }
}

export { extractTradeFromImage };