/**
 * Check if a date string is valid
 * @param {string|number|Date} value - The date value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDateString = (value) => {
  if (!value) return false;
  if (value === "NA" || value === "None" || value === "N/A") return false;

  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Normalize date to UTC midnight to ensure consistency
 * @param {string|number|Date} value - The date value
 * @returns {Date|null} - Normalized date or null
 */
const normalizeDate = (value) => {
  if (!value || !isValidDateString(value)) return null;
  const date = new Date(value);
  // Return the date as-is to preserve the exact value
  return date;
};

/**
 * Format a date according to the specified format string
 * @param {string|number|Date} value - The date value to format
 * @param {string} format - The format string (e.g., 'DD-MM-YYYY')
 * @returns {string} - Formatted date string
 */
export const formatDate = (value, format = "DD-MM-YYYY") => {
  const date = normalizeDate(value);
  if (!date) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthNamesLong = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  switch (format) {
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "MM-DD-YYYY":
      return `${month}-${day}-${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "DD MMM YYYY":
      return `${day} ${monthNames[date.getMonth()]} ${year}`;
    case "MMM DD, YYYY":
      return `${monthNames[date.getMonth()]} ${day}, ${year}`;
    case "MMMM DD, YYYY":
      return `${monthNamesLong[date.getMonth()]} ${day}, ${year}`;
    default:
      return `${day}-${month}-${year}`;
  }
};

/**
 * Format a date with time according to the specified format string
 * @param {string|number|Date} value - The date value to format
 * @param {string} format - The format string (e.g., 'DD-MM-YYYY HH: mm')
 * @returns {string} - Formatted date-time string
 */
export const formatTime = (value, format = "DD-MM-YYYY HH:mm") => {
  const date = normalizeDate(value);
  if (!date) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  switch (format) {
    case "DD-MM-YYYY HH:mm":
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    case "MM-DD-YYYY HH:mm":
      return `${month}-${day}-${year} ${hours}:${minutes}`;
    case "YYYY-MM-DD HH:mm":
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case "DD-MM-YYYY HH:mm: ss":
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    case "YYYY-MM-DD HH: mm:ss":
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case "DD MMM YYYY HH:mm":
      return `${day} ${
        monthNames[date.getMonth()]
      } ${year} ${hours}:${minutes}`;
    case "MMM DD, YYYY HH:mm":
      return `${
        monthNames[date.getMonth()]
      } ${day}, ${year} ${hours}:${minutes}`;
    case "DD/MM/YYYY HH:mm":
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case "MM/DD/YYYY HH:mm":
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    default:
      return `${day}-${month}-${year} ${hours}:${minutes}`;
  }
};

/**
 * Parse a date string to Date object
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} - Parsed date or null if invalid
 */
export const parseDate = (dateString) => {
  return normalizeDate(dateString);
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param {string|number|Date} value - The date value
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (value) => {
  const date = normalizeDate(value);
  if (!date) return "N/A";

  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  if (!d1 || !d2) return false;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Add days to a date
 * @param {Date} date - The base date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get date range string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} format - Date format
 * @returns {string} - Formatted date range
 */
export const getDateRange = (startDate, endDate, format = "DD MMM YYYY") => {
  const start = formatDate(startDate, format);
  const end = formatDate(endDate, format);
  return `${start} - ${end}`;
};
