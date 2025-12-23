/**
 * Get the locale for a given currency code
 * @param {string} currency - The currency code (e.g., 'USD', 'INR', 'EUR')
 * @param {array} currencyLookup - Array of currency objects with lookupKey and lookupLocale
 * @returns {string} - The locale string (e.g., 'en-US', 'en-IN')
 */
export const getCurrencyLocale = (currency, currencyLookup) => {
  if (!currency || !currencyLookup) return "en-US";
  const currencyData = currencyLookup.find(
    (item) => item.lookupKey === currency.toUpperCase()
  );
  return currencyData?.lookupLocale || "en-US";
};
/**
 * Format a number according to its currency's regional conventions
 * @param {number} amount - The number to format
 * @param {string} currency - The currency code (e.g., 'INR', 'USD', 'EUR')
 * @param {array} currencyLookup - Array of currency objects with lookupKey and lookupLocale
 * @returns {string} - The formatted number string
 */
export const formatCurrencyAmount = (amount, currency, currencyLookup) => {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  const locale = getCurrencyLocale(currency, currencyLookup);
  return new Intl.NumberFormat(locale).format(amount);
};
