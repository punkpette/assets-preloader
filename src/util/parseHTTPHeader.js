/**
 * Parses an HTTP header string and returns an object representation of the header.
 *
 * @param {string} headerString The HTTP header string to parse.
 * @return {Object} An object representation of the HTTP header.
 */
export default function parseHTTPHeader(headerString) {
  const headerSplit = headerString.split('\n');
  const parsedHeader = {};
  const regex = /([a-zA-Z0-9\-_]+): *(.+)/;
  let keyValue = null;

  for (let i = 0, len = headerSplit.length; i < len; i++) {
    // Skip empty lines
    if (headerSplit[i] !== '') {
      keyValue = regex.exec(headerSplit[i]);

      if (keyValue) {
        parsedHeader[keyValue[1]] = keyValue[2];
      }
    }
  }

  return parsedHeader;
}
