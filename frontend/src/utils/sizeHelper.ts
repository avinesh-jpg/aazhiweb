// src/utils/sizeHelper.ts

export interface SizeItem {
  name: string;
  stock: number;
  initialStock?: number;
  [key: string]: any;
}

/**
 * Calculates a numerical sort rank for kids clothing sizes and standard apparel sizes
 * so they are presented in natural ascending age/size order.
 * 
 * Order progression:
 * 1. Newborn / Months: NB (5) -> 0-3M (10) -> 3-6M (30) -> 6-12M (60) -> 12-18M (120) -> 18-24M (180) -> 6-24M (200)
 * 2. Years: 0-1Y (1000) -> 1-2Y (1100) -> 2-3Y (1200) -> 3-4Y (1300) -> ... -> 9-10Y (1900) -> 11-12Y (2100)
 * 3. Letter sizes: XS (3000) -> S (3100) -> M (3200) -> L (3300) -> XL (3400) -> XXL (3500)
 * 4. Free Size / One Size (5000)
 */
export const getSizeSortRank = (name: string): number => {
  if (!name) return 9999;
  const s = name.trim().toUpperCase();

  // Exact standard size mappings
  const exactRanks: Record<string, number> = {
    'NB': 5,
    'NEWBORN': 5,
    '0-3M': 10,
    '0-3 MONTHS': 10,
    '3-6M': 30,
    '3-6 MONTHS': 30,
    '6-9M': 50,
    '6-9 MONTHS': 50,
    '6-12M': 60,
    '6-12 MONTHS': 60,
    '9-12M': 90,
    '9-12 MONTHS': 90,
    '12-18M': 120,
    '12-18 MONTHS': 120,
    '18-24M': 180,
    '18-24 MONTHS': 180,
    '6-24M': 200,
    '6-24 MONTHS': 200,
    '0Y-5Y': 950,
    '0-5Y': 950,
    'XS': 3000,
    'EXTRA SMALL': 3000,
    'S': 3100,
    'SMALL': 3100,
    'M': 3200,
    'MEDIUM': 3200,
    'L': 3300,
    'LARGE': 3300,
    'XL': 3400,
    'EXTRA LARGE': 3400,
    'XXL': 3500,
    '2XL': 3500,
    '3XL': 3600,
    '4XL': 3700,
    'FREE SIZE': 5000,
    'ONE SIZE': 5000,
  };

  if (exactRanks[s] !== undefined) {
    return exactRanks[s];
  }

  // Adult multi-sizes: e.g. "3XL & 4XL"
  if (s.includes('3XL') || s.includes('4XL')) {
    return 3650;
  }

  // Regex for Month formats: e.g. "0-3M", "3-6 M", "6-12M", "12-18M"
  const monthMatch = s.match(/^(\d+)(?:\s*-\s*(\d+))?\s*(?:M|MTH|MTHS|MONTH|MONTHS)$/i);
  if (monthMatch) {
    const start = parseInt(monthMatch[1], 10);
    const end = monthMatch[2] ? parseInt(monthMatch[2], 10) : start;
    return start * 10 + end;
  }

  // Regex for Year formats: e.g. "2-3Y", "5-6Y", "9-10Y", "2-3 YRS", "3-4 YEARS", "2Y", "5Y", "1.5-2Y"
  const yearMatch = s.match(/^(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*(?:Y|YR|YRS|YEAR|YEARS)?$/i);
  if (yearMatch && !s.includes('M') && !s.includes('CM')) {
    const start = parseFloat(yearMatch[1]);
    const end = yearMatch[2] ? parseFloat(yearMatch[2]) : start;
    return 1000 + Math.round(start * 50) + end;
  }

  // Generic fallback: find any leading number (e.g. measurements like 90*90CM)
  const numMatch = s.match(/^(\d+)/);
  if (numMatch) {
    return 8000 + parseInt(numMatch[1], 10);
  }

  return 9999;
};

/**
 * Normalizes user-input or legacy database size variations into clean, canonical size strings.
 * Examples:
 *   "2 - 3y", "2-3Y ", "2Y-3Y", "2-3" -> "2-3Y"
 *   "18M - 24M", "18-24", "18-24M" -> "18-24M"
 *   " 7-8Y", "7Y-8Y" -> "7-8Y"
 *   "4Y To 6Y" -> "4-6Y"
 *   "2XL", "XXL " -> "XXL"
 */
export const normalizeSize = (raw: string | undefined | null): string => {
  if (!raw) return '';
  let s = String(raw).trim().toUpperCase();

  // Normalize multi-spaces
  s = s.replace(/\s+/g, ' ');

  // Standardize connector words like "TO" (e.g. "4Y TO 6Y" -> "4Y-6Y")
  s = s.replace(/\s*TO\s*/i, '-');

  // Strip whitespace around hyphens
  s = s.replace(/\s*-\s*/g, '-');

  // Canonicalize adult size aliases
  if (s === '2XL') return 'XXL';

  // Month ranges: e.g. "12M-18M", "18M-24M" -> "12-18M", "18-24M"
  s = s.replace(/(\d+)M-(\d+)M?/g, (_match, p1, p2) => `${p1}-${p2}M`);

  // Year ranges: e.g. "2Y-3Y", "4Y-6Y", "1.5Y-2Y" -> "2-3Y", "4-6Y", "1.5-2Y"
  s = s.replace(/(\d+(?:\.\d+)?)Y-(\d+(?:\.\d+)?)Y?/g, (_match, p1, p2) => `${p1}-${p2}Y`);

  // Numbers-only ranges without units (e.g. "18-24" -> "18-24M", "2-3" -> "2-3Y", "5-6" -> "5-6Y")
  const numRangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (numRangeMatch) {
    const start = parseInt(numRangeMatch[1], 10);
    const end = parseInt(numRangeMatch[2], 10);
    if (start >= 12 && end <= 24) {
      return `${start}-${end}M`;
    } else {
      return `${start}-${end}Y`;
    }
  }

  return s.trim();
};

/**
 * Returns a new array with sizes sorted in natural ascending order
 */
export const sortSizes = <T extends { name: string }>(sizes: T[] | undefined | null): T[] => {
  if (!sizes || !Array.isArray(sizes) || sizes.length <= 1) {
    return sizes ? [...sizes] : [];
  }
  return [...sizes].sort((a, b) => getSizeSortRank(a.name) - getSizeSortRank(b.name));
};
