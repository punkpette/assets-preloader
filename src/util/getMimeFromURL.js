import base64Mime from 'base64mime';
import getExtension from './getExtension';
import isBase64 from './isBase64';

const FILE_MIME = {
  // images
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  // text
  html: 'text/html',
  css: 'text/css',
  csv: 'text/csv',
  xml: 'text/xml',
  // video
  mp4: 'video/mp4',
  ogg: 'video/ogg',
  ogv: 'video/ogg',
  webm: 'video/webm',
  // audio
  wav: 'audio/wav',
  mp3: 'audio/mpeg'
};

/**
 * Returns a mime type based on a file extension or a URL.
 * @param {String} url The URL or file extension.
 * @returns {String} The mime type.
 */
export default function getMimeFromURL(url) {
  let mime;

  if (isBase64(url)) {
    mime = base64Mime(url);
  } else {
    const ext = getExtension(url);
    mime = FILE_MIME[ext.toLowerCase()];
  }

  return mime || 'application/octet-stream';
}
