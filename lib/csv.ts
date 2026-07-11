import { Holding, PortfolioLine } from "./types";

export interface CsvParseResult {
  lines: PortfolioLine[];
  unknownTickers: string[];
  errors: string[];
}

/**
 * Parses a simple CSV of holdings. Expected headers (case-insensitive, order
 * flexible): ticker, weight (or "shares"/"amount" as a fallback proxy for
 * relative weight — values are normalized to sum to 100% regardless of unit).
 * Example:
 *   ticker,weight
 *   AAPL,15
 *   MSFT,10
 */
export function parseHoldingsCsv(
  csvText: string,
  dataset: Holding[]
): CsvParseResult {
  const knownTickers = new Set(dataset.map((h) => h.ticker));
  const rows = csvText
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  const errors: string[] = [];
  const unknownTickers: string[] = [];
  const lines: PortfolioLine[] = [];

  if (rows.length === 0) {
    return { lines, unknownTickers, errors: ["The file is empty."] };
  }

  const header = rows[0].split(",").map((h) => h.trim().toLowerCase());
  const tickerIdx = header.findIndex((h) =>
    ["ticker", "symbol"].includes(h)
  );
  const weightIdx = header.findIndex((h) =>
    ["weight", "%", "percent", "allocation", "shares", "amount", "value"].includes(h)
  );

  const dataRows = tickerIdx === -1 ? rows : rows.slice(1);
  const effectiveTickerIdx = tickerIdx === -1 ? 0 : tickerIdx;
  const effectiveWeightIdx = weightIdx === -1 ? 1 : weightIdx;

  for (const row of dataRows) {
    const cols = row.split(",").map((c) => c.trim());
    if (cols.length < 2) {
      errors.push(`Skipped malformed row: "${row}"`);
      continue;
    }
    const ticker = (cols[effectiveTickerIdx] || "").toUpperCase();
    const rawWeight = parseFloat((cols[effectiveWeightIdx] || "").replace(/[%$,]/g, ""));

    if (!ticker) {
      errors.push(`Skipped row with missing ticker: "${row}"`);
      continue;
    }
    if (Number.isNaN(rawWeight) || rawWeight <= 0) {
      errors.push(`Skipped row with invalid weight for ${ticker}.`);
      continue;
    }
    if (!knownTickers.has(ticker)) {
      unknownTickers.push(ticker);
      continue;
    }

    lines.push({ ticker, weight: rawWeight });
  }

  const total = lines.reduce((sum, l) => sum + l.weight, 0);
  const normalized = total > 0 ? lines.map((l) => ({ ticker: l.ticker, weight: l.weight / total })) : [];

  return { lines: normalized, unknownTickers, errors };
}

export const SAMPLE_CSV_TEMPLATE = `ticker,weight\nAAPL,15\nMSFT,10\nXOM,12\nCVX,8\nNEE,5\nDUK,5\nJPM,10\nBAC,8\nCAT,7\nHON,5\nPG,5\nJNJ,5\nLIN,5\n`;
