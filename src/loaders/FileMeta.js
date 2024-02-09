import parseHTTPHeader from '../util/parseHTTPHeader';

/**
 * FileMeta is a class which will hold file meta data. Each LoaderBase contains a FileMeta object
 * that you can use to query.
 */
export default class FileMeta {
  /**
   * Constructor for FileMeta class.
   * @param {String} header HTTP Header sent when loading this file
   */
  constructor(header) {
    /**
     * This property is the mimetype for the file.
     * @type {String}
     */
    this.mime = null;

    /**
     * This is the file size in bytes.
     * @type {Number}
     */
    this.size = null;

    /**
     * This is a Date object which represents the last time this file was modified.
     * @type {Date}
     */
    this.lastModified = null;

    /**
     * This is the HTTP header as an Object for the file.
     * @type {Object}
     */
    this.httpHeader = null;

    if (header) this.setFromHTTPHeader(header);
  }

  /**
   * This function will parse the HTTP headers returned by a server and save useful information for development.
   * @param {String} header HTTP header returned by the server
   */
  setFromHTTPHeader(header) {
    this.httpHeader = parseHTTPHeader(header);

    if (this.httpHeader['content-length']) this.size = this.httpHeader['content-length'];

    if (this.httpHeader['content-type']) this.mime = this.httpHeader['content-type'];

    if (this.httpHeader['last-modified'])
      this.lastModified = new Date(this.httpHeader['last-modified']);
  }
}
