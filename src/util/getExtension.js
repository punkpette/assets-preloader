import base64Mime from 'base64mime';
import isBase64 from './isBase64';

/**
 * Returns the file extension based on the path passed in. If the file does not have an extension, null will be returned.
 * @param {String} url The URL we'd like a file extension from. This can be relative or absolute.
 * @returns {String|null} The file extension.
 */
export default function getExtension(url) {
  let ext;

  if (isBase64(url)) {
    const mime = base64Mime(url);
    ext = mime.split('/')[1];
  } else {
    ext = url.split('.').pop();
  }

  return ext || null;
}
