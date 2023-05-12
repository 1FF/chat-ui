/**
 * Minifies CSS code by removing newlines and excess whitespace.
 *
 * @param {string} css - The CSS code to be minified.
 * @returns {string} The minified CSS code.
 */
export default (css) => css.replace(/\n/g, '').replace(/\s\s+/g, ' ');