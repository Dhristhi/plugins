// Export translation utilities
export { createTranslationFunction, createErrorTranslationFunction } from './translation';

export const queryStringToObject = (query) => {
  return {
    ...Object.fromEntries(new URLSearchParams(query.replace(/\+/g, '%2B'))),
  };
};

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, k) => (o && o[k]) ?? null, obj);
};

export const updateNestedValue = (obj, path, newValue) => {
  return path.split('.').reduce((o, k, i, arr) => {
    if (i === arr.length - 1) {
      o[k] = newValue;
    } else {
      o[k] = { ...(o[k] ?? {}) };
    }
    return o[k];
  }, obj);
};

export const formatDate = (date, dateTimeFormat = 'DD-MM-YYYY HH:mm') => {
  if (!date || date === 'NA' || date === 'None') {
    return 'N/A';
  }

  const d = new Date(date);

  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  const map = {
    DD: d.getDate().toString().padStart(2, '0'),
    D: d.getDate().toString(),
    MM: (d.getMonth() + 1).toString().padStart(2, '0'),
    M: (d.getMonth() + 1).toString(),
    YYYY: d.getFullYear().toString(),
    YY: d.getFullYear().toString().slice(-2),
    HH: hours24.toString().padStart(2, '0'),
    hh: hours12.toString().padStart(2, '0'),
    mm: minutes.toString().padStart(2, '0'),
    ss: seconds.toString().padStart(2, '0'),
  };

  let result = dateTimeFormat.replace(/DD|D|MM|M|YYYY|YY|HH|hh|mm|ss/g, (match) => map[match]);

  // 👉 Append AM/PM if format contains either hh or HH
  if (dateTimeFormat.includes('hh')) {
    result += ` ${ampm}`;
  }

  return result.trim();
};

//fix: prevent misinterpretation of text+number strings as dates in dynamic renders
//note - We can Replace date patterns with date-fns validation if needed in phase 2
export const isValidDateString = (dateString) => {
  if (typeof dateString !== 'string' || !dateString.trim()) {
    return false;
  }
  const trimmed = dateString.trim();
  // Check for actual date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
    /^\d{4}\/\d{1,2}\/\d{1,2}$/,
    /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i,
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}$/i,
  ];

  const hasDatePattern = datePatterns.some((pattern) => pattern.test(trimmed));
  if (!hasDatePattern) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Currency to locale mapping for proper number formatting
const currencyLocaleMap = {
  // South Asian currencies - use Indian numbering system (lakhs/crores)
  INR: 'en-IN',

  // North American currencies - use standard Western numbering
  USD: 'en-US',
  CAD: 'en-CA',

  // European currencies
  EUR: 'en-US', // Use US format for EUR (1,234,567.89)
  GBP: 'en-GB',

  // Asia-Pacific currencies
  AUD: 'en-AU',
  SGD: 'en-SG',

  // Add more currencies as needed
};

/**
 * Get the appropriate locale for currency formatting based on currency code
 * @param {string} currency - The currency code (e.g., 'INR', 'USD', 'EUR')
 * @returns {string} - The locale string for Intl.NumberFormat
 */
export const getCurrencyLocale = (currency) => {
  return currencyLocaleMap[currency] || 'en-US'; // Default to US format
};

/**
 * Format a number according to its currency's regional conventions
 * @param {number} amount - The number to format
 * @param {string} currency - The currency code (e.g., 'INR', 'USD', 'EUR')
 * @returns {string} - The formatted number string
 */
export const formatCurrencyAmount = (amount, currency) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '';
  }

  const locale = getCurrencyLocale(currency);
  return new Intl.NumberFormat(locale).format(amount);
};
