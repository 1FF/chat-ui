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
 * Extracts a link from a given string.
 *
 * @param {string} string - The input string from which the link will be extracted.
 * @returns {string} The extracted link, or an empty string if no link is found.
 */
export function extractLink(string) {
  // Regular expression to match a URL
  const urlRegex = /((?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*)\b/gi;
  
  // Extract the link from the string
  const matches = string.match(urlRegex);
  const link = matches ? matches[0] : '';
  return link;
}