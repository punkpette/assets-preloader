/**
 * Converts an ArrayBuffer to a string.
 * @param {ArrayBuffer} buffer The ArrayBuffer to convert.
 * @returns {String} The string representation of the ArrayBuffer.
 */
export default function arrayBufferToString(buffer) {
  return String.fromCharCode(...new Uint16Array(buffer));
}
