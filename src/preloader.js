import EventEmitter from 'events';
import getExtension from './util/getExtension';
import LoaderImage from './loaders/LoaderImage';
import LoaderText from './loaders/LoaderText';
import LoaderJSON from './loaders/LoaderJSON';
import LoaderVideo from './loaders/LoaderVideo';
import LoaderAudio from './loaders/LoaderAudio';

/**
 *
 * Object defining which file extensions use which loaders
 *
 * @property LOADERS
 * @type {Object}
 */
const LOADERS = {
  png: LoaderImage,
  jpg: LoaderImage,
  jpeg: LoaderImage,
  webp: LoaderImage,
  gif: LoaderImage,
  json: LoaderJSON,
  mp4: LoaderVideo,
  ogg: LoaderVideo,
  ogv: LoaderVideo,
  webm: LoaderVideo,
  mp3: LoaderAudio,
  wav: LoaderAudio
};

/**
 *
 * Defines default loader
 *
 * @property LOADER_DEFAULT
 * @type {Function}
 */
const LOADER_DEFAULT = LoaderText;

class AssetsPreloader extends EventEmitter {
  constructor(options) {
    super();

    this.initialize(options);
  }

  parseOptions(options) {
    return {
      xhrImages: options.xhrImages || false,
      onComplete: typeof options.onComplete === 'function' ? options.onComplete : undefined,
      onProgress: typeof options.onProgress === 'function' ? options.onProgress : undefined,
      throttle: options.throttle || 0
    };
  }

  mergeOptions(options) {
    return {
      xhrImages: options.xhrImages || this.options.xhrImages,
      onComplete:
        typeof options.onComplete === 'function' ? options.onComplete : this.options.onComplete,
      onProgress:
        typeof options.onProgress === 'function' ? options.onProgress : this.options.onProgress,
      throttle: options.throttle || this.options.throttle
    };
  }

  initialize(options) {
    if (!(this instanceof AssetsPreloader)) {
      return new Preloader(options);
    }

    this.options = this.parseOptions(options);

    if (this.options.onComplete) {
      this.on('complete', this.options.onComplete);
    }

    if (this.options.onProgress) {
      this.on('progress', this.options.onProgress);
    }

    this.reset();
    this.loaders = {};
    this._continueLoadQueue = this._continueLoadQueue.bind(this);
  }

  /**
   *
   * Generic asset loader function - determines loader to be used based on file-extension
   *
   * @method add
   * @param {String} url Base URL of asset
   *
   */
  add(url, options) {
    if (url) {
      this.addFromLoaderType(url, this._getLoader(url), options);
    }
  }

  /**
   *
   * Load image - uses the LoaderImage loader
   *
   * @method addImage
   * @param {String} url Base URL of asset
   *
   */
  addImage(url, options) {
    this.addFromLoaderType(url, LoaderImage, options);
  }

  /**
   *
   * Load JSON - uses the LoaderJSON loader
   *
   * @method addJSON
   * @param {String} url Base URL of asset
   *
   */
  addJSON(url, options) {
    this.addFromLoaderType(url, LoaderJSON, options);
  }

  /**
   *
   * Load text - uses the LoaderText loader
   *
   * @method addText
   * @param {String} url Base URL of asset
   *
   */
  addText(url, options) {
    this.addFromLoaderType(url, LoaderText, options);
  }

  /**
   *
   * Load video - uses the LoaderVideo loader
   *
   * @method addVideo
   * @param {String} url Base URL of asset
   *
   */
  addVideo(url, options) {
    this.addFromLoaderType(url, LoaderVideo, options);
  }

  /**
   *
   * Load audio - uses the LoaderAudio loader
   *
   * @method addAudio
   * @param {String} url Base URL of asset
   *
   */
  addAudio(url, options) {
    this.addFromLoaderType(url, LoaderAudio, options);
  }

  /**
   *
   * Load asset using custom loader
   *
   * @method addFromLoaderType
   * @param {String} url Base URL of asset
   * @param {Function} loaderType Custom loader function
   *
   */
  addFromLoaderType(url, LoaderType, options) {
    if (!this.loaders[url]) {
      this.loaders[url] = new LoaderType(this.mergeOptions(options || {}));
      this.urls.push(url);

      return this.loaders[url];
    }
  }

  /**
   *
   * Sets percentage of total load for a given asset
   *
   * @method setPercentage
   * @param {String} url Base URL of asset
   * @param {Number} percentageOfLoad Number <= 1 representing percentage of total load
   *
   */
  setPercentage(url, percentageOfLoad) {
    this.percentageOfLoad[url] = percentageOfLoad;
  }

  /**
   *
   * Begins loading process
   *
   * @method load
   *
   */
  load() {
    if (!this.loading) {
      this._setupPercentages();

      const len = this.options.throttle || this.urls.length;

      for (let i = 0; i < len; i++) {
        this._continueLoadQueue();
      }
    }
  }

  /**
   *
   * Resets loading so you can reuse the preloader. does not remove cached loads so `get()` continues to function for all assets.
   *
   * @method reset
   *
   */
  reset() {
    this.percTotal = 0;
    this.loadIdx = 0;
    this.urls = [];
    this.progress = 0;
    this.percentageOfLoad = {};
    this.loading = false;
    this.status = {};
  }

  /**
   *
   * Stops loading process
   *
   * @method stopLoad
   *
   */
  stopLoad() {
    if (this.loading) {
      for (let i = 0, len = this.urls.length; i < len; i++) {
        this.loaders[this.urls[i]].stopLoad();
      }
    }
  }

  /**
   *
   * Retrieves loaded asset from loader
   *
   * @method get
   * @param {String} url Base URL of asset
   * @return asset instance
   */
  get(url) {
    return this.loaders[url] && this.loaders[url].content;
  }

  /**
   *
   * Loops through stated percentages of all assets and standardizes them
   *
   * @method _setupPercentages
   */
  _setupPercentages() {
    let percTotal = 0;
    let percScale = 1;
    let numWOPerc = 0;
    let oneFilePerc = 1 / this.urls.length;

    for (let i = 0, len = this.urls.length; i < len; i++) {
      if (this.percentageOfLoad[this.urls[i]]) {
        percTotal += this.percentageOfLoad[this.urls[i]];
      } else {
        numWOPerc++;
      }
    }

    if (numWOPerc > 0) {
      if (percTotal > 1) {
        percScale = 1 / percTotal;
        percTotal *= percScale;
      }

      oneFilePerc = (1 - percTotal) / numWOPerc;

      for (let i = 0, len = this.urls.length; i < len; i++) {
        if (this.percentageOfLoad[this.urls[i]]) {
          this.percentageOfLoad[this.urls[i]] *= percScale;
        } else {
          this.percentageOfLoad[this.urls[i]] = oneFilePerc;
        }
      }
    }
  }

  /**
   *
   * With every call, assets are successively loaded  and percentLoaded is updated
   *
   * @method _continueLoadQueue
   */
  _continueLoadQueue() {
    if (this.loadIdx < this.urls.length) {
      const url = this.urls[this.loadIdx];
      const loader = this.loaders[url];

      this.status[url] = false;
      this.loadIdx++;

      loader.on('progress', this._onLoadProgress.bind(this, url));
      loader.once('error', this._onLoadError.bind(this, url));
      loader.once('complete', this._onLoadComplete.bind(this, url));
      loader.load(url);
    } else if (this._checkComplete()) {
      this.emit('complete');
    }
  }

  /**
   *
   * Logs error, updates progress, and continues the load
   *
   *
   * @method _onLoadError
   * @param {String} url of current loading item
   * @param {String} error Error message/type
   */
  _onLoadError(url, error) {
    console.warn(`Couldn't load ${url}, received the error: ${error}`);
    const curPerc = this.percentageOfLoad[url];
    this.emit('progress', this.percTotal + curPerc, url);
    this.status[url] = true;
    this._continueLoadQueue();
  }

  /**
   *
   * Calculates progress of currently loading asset and dispatches total load progress
   *
   *
   * @method _onLoadProgress
   * @param {String} url of current loading item
   * @param {Number} progress Progress of currently loading asset
   */
  _onLoadProgress(url, progress) {
    const curPerc = this.percentageOfLoad[url] * progress;

    this.emit('progress', this.percTotal + curPerc, url);
  }

  /**
   *
   * Marks url as complete and updates total load percentage
   *
   *
   * @method _onLoadComplete
   * @param {String} url of current loading item
   * @param {Object} content The loaded content
   */
  _onLoadComplete(url, content) {
    this.percTotal += this.percentageOfLoad[url];
    this.status[url] = true;
    this._continueLoadQueue();
  }

  /**
   *
   * Returns true / false depending on if all url are finished loading or not
   *
   *
   * @method _checkComplete
   * @return {Boolean} Is loading done?
   */
  _checkComplete() {
    let loaded = true;

    for (let i = 0, len = this.urls.length; i < len; i++) {
      if (!this.status[this.urls[i]]) loaded = false;
    }

    return loaded;
  }

  /**
   *
   * Retrieves the appropriate loader util given the asset file-type
   *
   *
   * @method _getLoader
   * @param {String} url Base URL of asset
   * @return {Function} Chosen loader util function based on filetype/extension
   */
  _getLoader(url) {
    const extension = getExtension(url);
    let loader = LOADER_DEFAULT;

    if (extension && LOADERS[extension.toLowerCase()]) {
      loader = LOADERS[extension.toLowerCase()];
    }

    return loader;
  }
}

export default AssetsPreloader;
