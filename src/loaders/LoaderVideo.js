import LoaderBase from './LoaderBase';

/**
 * LoaderVideo will load a video file. The content property will contain a video tag.
 *
 * @class LoaderVideo
 * @constructor
 * @extends {LoaderBase}
 */
class LoaderVideo extends LoaderBase {
  constructor(options) {
    super(LoaderBase.typeVideo, options);
  }

  _parseContent() {
    super._parseContent();

    if (window.URL && window.URL.createObjectURL) {
      const blobURL = window.URL.createObjectURL(this.content);
      this.content = document.createElement(this.loadType);
      this.content.src = blobURL;
    } else {
      throw new Error('This browser does not support URL.createObjectURL()');
    }
  }
}

export default LoaderVideo;
