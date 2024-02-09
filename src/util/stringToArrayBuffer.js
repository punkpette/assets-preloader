/**
 * Converts a string to an ArrayBuffer.
 *
 * @param {string} string The string to convert to an array buffer.
 * @return {ArrayBuffer} The string data converted into an ArrayBuffer.
 */
export default function stringToArrayBuffer(string) {
  const buf = new ArrayBuffer(string.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);

  for (let i = 0, strLen = string.length; i < strLen; i++) {
    bufView[i] = string.charCodeAt(i);
  }

  return buf;
}
