/**
 * Checks if a string is a valid base64 encoded string.
 * @see {@link https://github.com/miguelmota/is-base64/pull/2}
 * @param {string} v The string to check.
 * @returns {boolean} True if the string is a valid base64 encoded string, otherwise false.
 */
export default function isBase64(v) {
  const regex =
    /^(data:\w+\/[a-zA-Z\+\-\.]+;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/gi;
  return regex.test(v);
}
