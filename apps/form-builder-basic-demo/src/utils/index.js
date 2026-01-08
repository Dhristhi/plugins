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

export const formatDate = (
  date,
  dateTimeFormat = 'DD-MM-YYYY HH:mm',
  includeTime = false,
  timeFormat = '12h'
) => {
  if (!date || date === 'NA' || date === 'None') {
    return 'N/A';
  }

  const d = new Date(date);

  // Handle both predefined and pattern-based formats
  if (typeof dateTimeFormat === 'string') {
    // Handle pattern-based formats
    const formatPatterns = {
      'D MMM YYYY': 'D MMM YYYY',
      'DD MMMM YYYY': 'DD MMMM YYYY',
      'MM/DD/YYYY': 'MM/DD/YYYY',
      'DD/MM/YYYY': 'DD/MM/YYYY',
      'YYYY-MM-DD': 'YYYY-MM-DD',
      'DD MMM YYYY, HH:mm': 'DD MMM YYYY, HH:mm',
      'MMMM D, YYYY at h:mm A': 'MMMM D, YYYY at h:mm A',
      'MMM D, YYYY • HH:mm': 'MMM D, YYYY • HH:mm',
      'ddd, D MMM YYYY, HH:mm': 'ddd, D MMM YYYY, HH:mm',
    };

    if (formatPatterns[dateTimeFormat]) {
      // Use the enhanced formatting function with the pattern
      return formatDateWithPattern(d, dateTimeFormat);
    }

    // Legacy format handling for backward compatibility
    switch (dateTimeFormat) {
      case 'friendly':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      case 'full-friendly':
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      case 'us':
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;

      case 'eu':
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

      case 'iso':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

      // Legacy time-included formats
      case 'international-ui':
        const intlDay = d.getDate().toString().padStart(2, '0');
        const intlMonth = d.toLocaleDateString('en-US', { month: 'short' });
        const intlYear = d.getFullYear();
        const intlTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return `${intlDay} ${intlMonth} ${intlYear}, ${intlTime}`;

      case 'friendly-text':
        const friendlyDate = d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        const hours12 = d.getHours() % 12 || 12;
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
        return `${friendlyDate} at ${hours12}:${minutes} ${ampm}`;

      case 'dashboard':
        const dashDate = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const dashTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return `${dashDate} • ${dashTime}`;

      case 'calendar':
        const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
        const calDay = d.getDate();
        const calMonth = d.toLocaleDateString('en-US', { month: 'short' });
        const calYear = d.getFullYear();
        const calTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return `${dayOfWeek}, ${calDay} ${calMonth} ${calYear}, ${calTime}`;
    }
  }

  // Legacy format handling with custom patterns
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

// Enhanced pattern-based date formatting function
const formatDateWithPattern = (date, pattern) => {
  const d = date;
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  const formatMap = {
    // Day patterns
    D: d.getDate().toString(), // 8
    DD: d.getDate().toString().padStart(2, '0'), // 08

    // Month patterns
    M: (d.getMonth() + 1).toString(), // 1
    MM: (d.getMonth() + 1).toString().padStart(2, '0'), // 01
    MMM: d.toLocaleDateString('en-US', { month: 'short' }), // Jan
    MMMM: d.toLocaleDateString('en-US', { month: 'long' }), // January

    // Year patterns
    YY: d.getFullYear().toString().slice(-2), // 25
    YYYY: d.getFullYear().toString(), // 2025

    // Time patterns
    H: hours24.toString(), // 14
    HH: hours24.toString().padStart(2, '0'), // 14
    h: hours12.toString(), // 2
    hh: hours12.toString().padStart(2, '0'), // 02
    mm: minutes.toString().padStart(2, '0'), // 30
    ss: seconds.toString().padStart(2, '0'), // 45
    A: ampm, // PM

    // Day of week
    ddd: d.toLocaleDateString('en-US', { weekday: 'short' }), // Thu
    dddd: d.toLocaleDateString('en-US', { weekday: 'long' }), // Thursday
  };

  // Replace patterns in order of length (longest first to avoid conflicts)
  const tokens = Object.keys(formatMap).sort((a, b) => b.length - a.length);
  let result = pattern;

  tokens.forEach((token) => {
    const regex = new RegExp(token, 'g');
    result = result.replace(regex, formatMap[token]);
  });

  return result;
};

// Helper function to format time only
const formatTimeOnly = (date, timeFormat) => {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  switch (timeFormat) {
    case '12h':
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    case '24h':
      return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    case '12h-seconds':
      return `${hours12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    case '24h-seconds':
      return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    default:
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
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
