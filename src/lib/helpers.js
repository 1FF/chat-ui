/**
 * Generates a random integer between the specified range (inclusive).
 *
 * @param {number} from - The starting value of the range.
 * @param {number} to - The ending value of the range.
 * @returns {number} The random integer generated.
 */
export function getRandomInteger(from, to) {
  return Math.floor(Math.random() * to) + from;
}


/**
   * Formats a date string according to the locale, including the date and time.
   *
   * @param {string} dateString - The date string to be formatted.
   * @returns {string} - The formatted date and time string.
   */
export function formatDateByLocale(dateString) {
  const date = new Date(dateString);

  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };

  const formattedDate = date.toLocaleDateString(undefined, options);

  return `${formattedDate}`.toUpperCase();
};


/**
 * Checks if a string contains a URL.
 *
 * @param {string} str - The input string to check.
 * @returns {boolean} - True if the string contains a URL, false otherwise.
 */
export function containsURL(str) {
  // Regular expression pattern to match URLs for http and https containing string;
  const urlRegex = /(https?:\/\/[^\s]+)/;
  return urlRegex.test(str);
}