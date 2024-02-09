import LoaderBase from './LoaderBase';
import FileMeta from './FileMeta';
import getMimeFromURL from './../util/getMimeFromURL';

class LoaderImage extends LoaderBase {
  /**
   * LoaderImage will load in images. If XHR exists in the browser attempting to load image
   * then XHR will be used otherwise LoaderImage will use Image instead to load the Image.
   *
   * @class LoaderImage
   * @constructor
   * @extends {LoaderBase}
   */
  constructor(options) {
    super(LoaderBase.typeArraybuffer, options);
    this._imageLoaded = false;
  }

  load(url) {
    if (
      this.options.xhrImages &&
      this.canLoadUsingXHR() &&
      this.canLoadType(this.loadType) &&
      ArrayBuffer &&
      (window.URL || window.webkitURL || FileReader)
    ) {
      super.load(url);
    } else {
      this._createAndLoadImage(url);
    }
  }

  _dispatchProgress(progress) {
    super._dispatchProgress(this._imageLoaded ? progress : progress * 0.9999);
  }

  _dispatchComplete() {
    if (this._imageLoaded) super._dispatchComplete();
  }

  _onImageLoadComplete() {
    this._imageLoaded = true;
    this._dispatchProgress(1);
    this._dispatchComplete();
  }

  _onImageLoadFail() {
    this._dispatchError('Image failed to load');
  }

  _parseContent() {
    let arrayBuffer = null;
    let blobData = null;

    if (!this.fileMeta) {
      this.fileMeta = new FileMeta();
    }

    if (!this.loadTypeSet || this.fileMeta.mime === null) {
      this.fileMeta.mime = getMimeFromURL(this.url);
    }

    if (this.xhr.response instanceof ArrayBuffer) {
      arrayBuffer = this.xhr.response;
    } else if (this.xhr.mozResponseArrayBuffer) {
      arrayBuffer = this.xhr.mozResponseArrayBuffer;
    } else {
      throw new Error('Return type for image load unsupported');
    }

    blobData = new Blob([arrayBuffer], { type: this.fileMeta.mime });

    if (window.URL || window.webkitURL) {
      this._createAndLoadImage((window.URL || window.webkitURL).createObjectURL(blobData));
    } else if (FileReader) {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (window.URL || window.webkitURL) {
          (window.URL || window.webkitURL).revokeObjectURL(blobData);
        }
        this._createAndLoadImage(reader.result);
      };

      reader.readAsDataURL(blobData);
    }
  }

  _createAndLoadImage(src) {
    this.content = new Image();
    this.content.onload = this._onImageLoadComplete.bind(this);
    this.content.onerror = this._onImageLoadFail.bind(this);
    this.content.src = src;
  }
}

export default LoaderImage;
