import LoaderBase from './LoaderBase';

class LoaderBlob extends LoaderBase {
  /**
   * LoaderBlob will load a file and the content saved in this Loader will be a Blob
   *
   * @class LoaderBlob
   * @constructor
   * @extends {LoaderBase}
   */
  constructor(options) {
    super(LoaderBase.typeBlob, options);
  }
}

export default LoaderBlob;
