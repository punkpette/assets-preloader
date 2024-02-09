import g from "events";
var _ = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function A(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var p = { exports: {} };
(function(o, e) {
  (function() {
    function t(i) {
      var n = null;
      if (typeof i != "string")
        return n;
      var r = i.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      return r && r.length && (n = r[1]), n;
    }
    o.exports && (e = o.exports = t), e.base64MimeType = t;
  }).call(_);
})(p, p.exports);
var R = p.exports;
const m = /* @__PURE__ */ A(R);
function y(o) {
  return /^(data:\w+\/[a-zA-Z\+\-\.]+;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/gi.test(o);
}
function w(o) {
  let e;
  return y(o) ? e = m(o).split("/")[1] : e = o.split(".").pop(), e || null;
}
function C(o) {
  const e = o.split(`
`), t = {}, i = /([a-zA-Z0-9\-_]+): *(.+)/;
  let n = null;
  for (let r = 0, l = e.length; r < l; r++)
    e[r] !== "" && (n = i.exec(e[r]), n && (t[n[1]] = n[2]));
  return t;
}
class d {
  /**
   * Constructor for FileMeta class.
   * @param {String} header HTTP Header sent when loading this file
   */
  constructor(e) {
    this.mime = null, this.size = null, this.lastModified = null, this.httpHeader = null, e && this.setFromHTTPHeader(e);
  }
  /**
   * This function will parse the HTTP headers returned by a server and save useful information for development.
   * @param {String} header HTTP header returned by the server
   */
  setFromHTTPHeader(e) {
    this.httpHeader = C(e), this.httpHeader["content-length"] && (this.size = this.httpHeader["content-length"]), this.httpHeader["content-type"] && (this.mime = this.httpHeader["content-type"]), this.httpHeader["last-modified"] && (this.lastModified = new Date(this.httpHeader["last-modified"]));
  }
}
function u(o) {
  const e = new ArrayBuffer(o.length * 2), t = new Uint16Array(e);
  for (let i = 0, n = o.length; i < n; i++)
    t[i] = o.charCodeAt(i);
  return e;
}
const P = {
  // images
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  // text
  html: "text/html",
  css: "text/css",
  csv: "text/csv",
  xml: "text/xml",
  // video
  mp4: "video/mp4",
  ogg: "video/ogg",
  ogv: "video/ogg",
  webm: "video/webm",
  // audio
  wav: "audio/wav",
  mp3: "audio/mpeg"
};
function x(o) {
  let e;
  if (y(o))
    e = m(o);
  else {
    const t = w(o);
    e = P[t.toLowerCase()];
  }
  return e || "application/octet-stream";
}
class s extends g {
  constructor(e, t) {
    super(), this.options = t || {}, this.options.onComplete && this.on("complete", this.options.onComplete), this.options.onProgress && this.on("progress", this.options.onProgress), this.xhr = null, this.content = null, this.url = null, this.loadType = e || s.typeText, this.loadTypeSet = !1, this.fileMeta = null, this._onStateChange = this._onStateChange.bind(this), this._onProgress = this._onProgress.bind(this), this._dispatchProgress = this._dispatchProgress.bind(this), this._dispatchComplete = this._dispatchComplete.bind(this);
  }
  canLoadUsingXHR() {
    return typeof XMLHttpRequest < "u";
  }
  canLoadType(e) {
    const t = new XMLHttpRequest();
    return t.open("GET", "someFakeURL", !0), this.checkAndSetType(t, e);
  }
  load(e) {
    if (this.url = e, this.canLoadUsingXHR()) {
      if (this.xhr = new XMLHttpRequest(), this.xhr.open("GET", e, !0), this.xhr.onreadystatechange = this._onStateChange, this.xhr.onprogress !== void 0 && (this.xhr.onprogress = this._onProgress), this.loadType !== s.typeText) {
        this.checkIfGoodValue() || (console.warn(
          `Attempting to use incompatible load type ${this.loadType}. Switching it to ${s.typeText}`
        ), this.loadType = s.typeText);
        try {
          this.loadTypeSet = this.checkResponseTypeSupport() && this.checkAndSetType(this.xhr, this.loadType);
        } catch {
          this.loadTypeSet = !1;
        }
        !this.loadTypeSet && (this.loadType === s.typeBlob || this.loadType === s.typeArraybuffer) && this.xhr.overrideMimeType("text/plain; charset=x-user-defined");
      }
      this.xhr.send();
    }
  }
  stopLoad() {
    this.xhr.abort();
  }
  _dispatchStart() {
    this.emit("start");
  }
  _dispatchProgress(e) {
    this.emit("progress", e);
  }
  _dispatchComplete() {
    this.emit("complete", this.content);
  }
  _dispatchError(e) {
    this.emit("error", e);
  }
  _onProgress(e) {
    const t = e.loaded || e.position, i = e.total || e.totalSize;
    i ? this._dispatchProgress(t / i) : this._dispatchProgress(0);
  }
  _onStateChange() {
    if (this.xhr.readyState > 1) {
      let e, t = !1;
      try {
        e = this.xhr.status;
      } catch {
        t = !0;
      }
      if (e === 200)
        switch (this.xhr.readyState) {
          case 2:
            this.fileMeta = new d(this.xhr.getAllResponseHeaders()), this._dispatchStart();
            break;
          case 3:
            break;
          case 4:
            this._parseContent(), this._dispatchComplete();
            break;
        }
      else
        t || (this.xhr.onreadystatechange = void 0, this._dispatchError(this.xhr.status));
    }
  }
  _parseContent() {
    if (this.loadTypeSet || this.loadType === s.typeText)
      this.content = this.xhr.response || this.xhr.responseText;
    else
      switch (this.loadType) {
        case s.typeArraybuffer:
          if (ArrayBuffer)
            this.content = u(this.xhr.response);
          else
            throw new Error("This browser does not support ArrayBuffer");
          break;
        case s.typeBlob:
        case s.typeVideo:
        case s.typeAudio:
          if (Blob)
            this.fileMeta || (this.fileMeta = new d()), this.fileMeta.mime === null && (this.fileMeta.mime = x(this.url)), this.content = new Blob([u(this.xhr.response)], {
              type: this.fileMeta.mime
            });
          else
            throw new Error("This browser does not support Blob");
          break;
        case s.typeJSON:
          this.content = JSON.parse(this.xhr.response);
          break;
        case s.typeDocument:
          this.content = this.xhr.response;
          break;
      }
  }
  checkIfGoodValue() {
    return this.loadType === s.typeText || this.loadType === s.typeArraybuffer || this.loadType === s.typeBlob || this.loadType === s.typeJSON || this.loadType === s.typeDocument || this.loadType === s.typeVideo || this.loadType === s.typeAudio;
  }
  checkResponseTypeSupport() {
    return this.xhr.responseType !== void 0;
  }
  checkAndSetType(e, t) {
    return (t === s.typeVideo || t === s.typeAudio) && (t = s.typeBlob), e.responseType = t, e.responseType === t;
  }
}
s.typeText = "text";
s.typeArraybuffer = "arraybuffer";
s.typeBlob = "blob";
s.typeJSON = "json";
s.typeDocument = "document";
s.typeVideo = "video";
s.typeAudio = "audio";
class a extends s {
  /**
   * LoaderImage will load in images. If XHR exists in the browser attempting to load image
   * then XHR will be used otherwise LoaderImage will use Image instead to load the Image.
   *
   * @class LoaderImage
   * @constructor
   * @extends {LoaderBase}
   */
  constructor(e) {
    super(s.typeArraybuffer, e), this._imageLoaded = !1;
  }
  load(e) {
    this.options.xhrImages && this.canLoadUsingXHR() && this.canLoadType(this.loadType) && ArrayBuffer && (window.URL || window.webkitURL || FileReader) ? super.load(e) : this._createAndLoadImage(e);
  }
  _dispatchProgress(e) {
    super._dispatchProgress(this._imageLoaded ? e : e * 0.9999);
  }
  _dispatchComplete() {
    this._imageLoaded && super._dispatchComplete();
  }
  _onImageLoadComplete() {
    this._imageLoaded = !0, this._dispatchProgress(1), this._dispatchComplete();
  }
  _onImageLoadFail() {
    this._dispatchError("Image failed to load");
  }
  _parseContent() {
    let e = null, t = null;
    if (this.fileMeta || (this.fileMeta = new d()), (!this.loadTypeSet || this.fileMeta.mime === null) && (this.fileMeta.mime = x(this.url)), this.xhr.response instanceof ArrayBuffer)
      e = this.xhr.response;
    else if (this.xhr.mozResponseArrayBuffer)
      e = this.xhr.mozResponseArrayBuffer;
    else
      throw new Error("Return type for image load unsupported");
    if (t = new Blob([e], { type: this.fileMeta.mime }), window.URL || window.webkitURL)
      this._createAndLoadImage((window.URL || window.webkitURL).createObjectURL(t));
    else if (FileReader) {
      const i = new FileReader();
      i.onloadend = () => {
        (window.URL || window.webkitURL) && (window.URL || window.webkitURL).revokeObjectURL(t), this._createAndLoadImage(i.result);
      }, i.readAsDataURL(t);
    }
  }
  _createAndLoadImage(e) {
    this.content = new Image(), this.content.onload = this._onImageLoadComplete.bind(this), this.content.onerror = this._onImageLoadFail.bind(this), this.content.src = e;
  }
}
class T extends s {
  constructor(e) {
    super(s.typeText, e);
  }
}
class b extends s {
  constructor(e) {
    super(s.typeJSON, e);
  }
}
class h extends s {
  constructor(e) {
    super(s.typeVideo, e);
  }
  _parseContent() {
    if (super._parseContent(), window.URL && window.URL.createObjectURL) {
      const e = window.URL.createObjectURL(this.content);
      this.content = document.createElement(this.loadType), this.content.src = e;
    } else
      throw new Error("This browser does not support URL.createObjectURL()");
  }
}
class c extends h {
  /**
   * Constructor for LoaderAudio class.
   * @param {Object} options Options for the loader
   */
  constructor(e) {
    super(e), this.loadType = s.typeAudio;
  }
}
const f = {
  png: a,
  jpg: a,
  jpeg: a,
  webp: a,
  gif: a,
  json: b,
  mp4: h,
  ogg: h,
  ogv: h,
  webm: h,
  mp3: c,
  wav: c
}, S = T;
class L extends g {
  constructor(e) {
    super(), this.initialize(e);
  }
  parseOptions(e) {
    return {
      xhrImages: e.xhrImages || !1,
      onComplete: typeof e.onComplete == "function" ? e.onComplete : void 0,
      onProgress: typeof e.onProgress == "function" ? e.onProgress : void 0,
      throttle: e.throttle || 0
    };
  }
  mergeOptions(e) {
    return {
      xhrImages: e.xhrImages || this.options.xhrImages,
      onComplete: typeof e.onComplete == "function" ? e.onComplete : this.options.onComplete,
      onProgress: typeof e.onProgress == "function" ? e.onProgress : this.options.onProgress,
      throttle: e.throttle || this.options.throttle
    };
  }
  initialize(e) {
    if (!(this instanceof L))
      return new Preloader(e);
    this.options = this.parseOptions(e), this.options.onComplete && this.on("complete", this.options.onComplete), this.options.onProgress && this.on("progress", this.options.onProgress), this.reset(), this.loaders = {}, this._continueLoadQueue = this._continueLoadQueue.bind(this);
  }
  /**
   *
   * Generic asset loader function - determines loader to be used based on file-extension
   *
   * @method add
   * @param {String} url Base URL of asset
   *
   */
  add(e, t) {
    e && this.addFromLoaderType(e, this._getLoader(e), t);
  }
  /**
   *
   * Load image - uses the LoaderImage loader
   *
   * @method addImage
   * @param {String} url Base URL of asset
   *
   */
  addImage(e, t) {
    this.addFromLoaderType(e, a, t);
  }
  /**
   *
   * Load JSON - uses the LoaderJSON loader
   *
   * @method addJSON
   * @param {String} url Base URL of asset
   *
   */
  addJSON(e, t) {
    this.addFromLoaderType(e, b, t);
  }
  /**
   *
   * Load text - uses the LoaderText loader
   *
   * @method addText
   * @param {String} url Base URL of asset
   *
   */
  addText(e, t) {
    this.addFromLoaderType(e, T, t);
  }
  /**
   *
   * Load video - uses the LoaderVideo loader
   *
   * @method addVideo
   * @param {String} url Base URL of asset
   *
   */
  addVideo(e, t) {
    this.addFromLoaderType(e, h, t);
  }
  /**
   *
   * Load audio - uses the LoaderAudio loader
   *
   * @method addAudio
   * @param {String} url Base URL of asset
   *
   */
  addAudio(e, t) {
    this.addFromLoaderType(e, c, t);
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
  addFromLoaderType(e, t, i) {
    if (!this.loaders[e])
      return this.loaders[e] = new t(this.mergeOptions(i || {})), this.urls.push(e), this.loaders[e];
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
  setPercentage(e, t) {
    this.percentageOfLoad[e] = t;
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
      const e = this.options.throttle || this.urls.length;
      for (let t = 0; t < e; t++)
        this._continueLoadQueue();
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
    this.percTotal = 0, this.loadIdx = 0, this.urls = [], this.progress = 0, this.percentageOfLoad = {}, this.loading = !1, this.status = {};
  }
  /**
   *
   * Stops loading process
   *
   * @method stopLoad
   *
   */
  stopLoad() {
    if (this.loading)
      for (let e = 0, t = this.urls.length; e < t; e++)
        this.loaders[this.urls[e]].stopLoad();
  }
  /**
   *
   * Retrieves loaded asset from loader
   *
   * @method get
   * @param {String} url Base URL of asset
   * @return asset instance
   */
  get(e) {
    return this.loaders[e] && this.loaders[e].content;
  }
  /**
   *
   * Loops through stated percentages of all assets and standardizes them
   *
   * @method _setupPercentages
   */
  _setupPercentages() {
    let e = 0, t = 1, i = 0, n = 1 / this.urls.length;
    for (let r = 0, l = this.urls.length; r < l; r++)
      this.percentageOfLoad[this.urls[r]] ? e += this.percentageOfLoad[this.urls[r]] : i++;
    if (i > 0) {
      e > 1 && (t = 1 / e, e *= t), n = (1 - e) / i;
      for (let r = 0, l = this.urls.length; r < l; r++)
        this.percentageOfLoad[this.urls[r]] ? this.percentageOfLoad[this.urls[r]] *= t : this.percentageOfLoad[this.urls[r]] = n;
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
      const e = this.urls[this.loadIdx], t = this.loaders[e];
      this.status[e] = !1, this.loadIdx++, t.on("progress", this._onLoadProgress.bind(this, e)), t.once("error", this._onLoadError.bind(this, e)), t.once("complete", this._onLoadComplete.bind(this, e)), t.load(e);
    } else
      this._checkComplete() && this.emit("complete");
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
  _onLoadError(e, t) {
    console.warn(`Couldn't load ${e}, received the error: ${t}`);
    const i = this.percentageOfLoad[e];
    this.emit("progress", this.percTotal + i, e), this.status[e] = !0, this._continueLoadQueue();
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
  _onLoadProgress(e, t) {
    const i = this.percentageOfLoad[e] * t;
    this.emit("progress", this.percTotal + i, e);
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
  _onLoadComplete(e, t) {
    this.percTotal += this.percentageOfLoad[e], this.status[e] = !0, this._continueLoadQueue();
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
    let e = !0;
    for (let t = 0, i = this.urls.length; t < i; t++)
      this.status[this.urls[t]] || (e = !1);
    return e;
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
  _getLoader(e) {
    const t = w(e);
    let i = S;
    return t && f[t.toLowerCase()] && (i = f[t.toLowerCase()]), i;
  }
}
export {
  L as default
};
