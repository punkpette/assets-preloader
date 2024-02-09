import LoaderBase from './LoaderBase';

/**
 * LoaderArrayBuffer will load a file and the content saved in this Loader will be an ArrayBuffer.
 */
export default class LoaderArrayBuffer extends LoaderBase {
  /**
   * Constructor for LoaderArrayBuffer class.
   * @param {Object} options Options for the loader
   */
  constructor(options) {
    super(LoaderBase.typeArraybuffer, options);
  }
}
