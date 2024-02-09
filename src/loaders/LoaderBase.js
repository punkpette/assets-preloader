import EventEmitter from 'events';
import FileMeta from './FileMeta';
import stringToArrayBuffer from '../util/stringToArrayBuffer';
import getMimeFromURL from '../util/getMimeFromURL';

class LoaderBase extends EventEmitter {
  constructor(loadType, options) {
    super();

    this.options = options || {};

    if (this.options.onComplete) {
      this.on('complete', this.options.onComplete);
    }

    if (this.options.onProgress) {
      this.on('progress', this.options.onProgress);
    }

    this.xhr = null;
    this.content = null;
    this.url = null;
    this.loadType = loadType || LoaderBase.typeText;
    this.loadTypeSet = false;
    this.fileMeta = null;

    this._onStateChange = this._onStateChange.bind(this);
    this._onProgress = this._onProgress.bind(this);
    this._dispatchProgress = this._dispatchProgress.bind(this);
    this._dispatchComplete = this._dispatchComplete.bind(this);
  }

  canLoadUsingXHR() {
    return typeof XMLHttpRequest !== 'undefined';
  }

  canLoadType(type) {
    const tempXHR = new XMLHttpRequest();
    tempXHR.open('GET', 'someFakeURL', true);

    return this.checkAndSetType(tempXHR, type);
  }

  load(url) {
    this.url = url;

    if (this.canLoadUsingXHR()) {
      this.xhr = new XMLHttpRequest();
      this.xhr.open('GET', url, true);
      this.xhr.onreadystatechange = this._onStateChange;
      this.xhr.onprogress !== undefined && (this.xhr.onprogress = this._onProgress);

      if (this.loadType !== LoaderBase.typeText) {
        if (!this.checkIfGoodValue()) {
          console.warn(
            `Attempting to use incompatible load type ${this.loadType}. Switching it to ${LoaderBase.typeText}`
          );
          this.loadType = LoaderBase.typeText;
        }

        try {
          this.loadTypeSet =
            this.checkResponseTypeSupport() && this.checkAndSetType(this.xhr, this.loadType);
        } catch (e) {
          this.loadTypeSet = false;
        }

        if (
          !this.loadTypeSet &&
          (this.loadType === LoaderBase.typeBlob || this.loadType === LoaderBase.typeArraybuffer)
        ) {
          this.xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
      }

      this.xhr.send();
    }
  }

  stopLoad() {
    this.xhr.abort();
  }

  _dispatchStart() {
    this.emit('start');
  }

  _dispatchProgress(value) {
    this.emit('progress', value);
  }

  _dispatchComplete() {
    this.emit('complete', this.content);
  }

  _dispatchError(msg) {
    this.emit('error', msg);
  }

  _onProgress(ev) {
    const loaded = ev.loaded || ev.position;
    const totalSize = ev.total || ev.totalSize;

    if (totalSize) {
      this._dispatchProgress(loaded / totalSize);
    } else {
      this._dispatchProgress(0);
    }
  }

  _onStateChange() {
    if (this.xhr.readyState > 1) {
      let status;
      let waiting = false;

      try {
        status = this.xhr.status;
      } catch (e) {
        waiting = true;
      }

      if (status === 200) {
        switch (this.xhr.readyState) {
          case 2:
            this.fileMeta = new FileMeta(this.xhr.getAllResponseHeaders());
            this._dispatchStart();
            break;
          case 3:
            break;
          case 4:
            this._parseContent();
            this._dispatchComplete();
            break;
        }
      } else if (!waiting) {
        this.xhr.onreadystatechange = undefined;
        this._dispatchError(this.xhr.status);
      }
    }
  }

  _parseContent() {
    if (this.loadTypeSet || this.loadType === LoaderBase.typeText) {
      this.content = this.xhr.response || this.xhr.responseText;
    } else {
      switch (this.loadType) {
        case LoaderBase.typeArraybuffer:
          if (ArrayBuffer) {
            this.content = stringToArrayBuffer(this.xhr.response);
          } else {
            throw new Error('This browser does not support ArrayBuffer');
          }
          break;
        case LoaderBase.typeBlob:
        case LoaderBase.typeVideo:
        case LoaderBase.typeAudio:
          if (Blob) {
            if (!this.fileMeta) {
              this.fileMeta = new FileMeta();
            }

            if (this.fileMeta.mime === null) {
              this.fileMeta.mime = getMimeFromURL(this.url);
            }

            this.content = new Blob([stringToArrayBuffer(this.xhr.response)], {
              type: this.fileMeta.mime
            });
          } else {
            throw new Error('This browser does not support Blob');
          }
          break;
        case LoaderBase.typeJSON:
          this.content = JSON.parse(this.xhr.response);
          break;
        case LoaderBase.typeDocument:
          this.content = this.xhr.response;
          break;
      }
    }
  }

  checkIfGoodValue() {
    return (
      this.loadType === LoaderBase.typeText ||
      this.loadType === LoaderBase.typeArraybuffer ||
      this.loadType === LoaderBase.typeBlob ||
      this.loadType === LoaderBase.typeJSON ||
      this.loadType === LoaderBase.typeDocument ||
      this.loadType === LoaderBase.typeVideo ||
      this.loadType === LoaderBase.typeAudio
    );
  }

  checkResponseTypeSupport() {
    return this.xhr.responseType !== undefined;
  }

  checkAndSetType(xhr, loadType) {
    if (loadType === LoaderBase.typeVideo || loadType === LoaderBase.typeAudio) {
      loadType = LoaderBase.typeBlob;
    }

    xhr.responseType = loadType;

    return xhr.responseType === loadType;
  }
}

// Static properties
LoaderBase.typeText = 'text';
LoaderBase.typeArraybuffer = 'arraybuffer';
LoaderBase.typeBlob = 'blob';
LoaderBase.typeJSON = 'json';
LoaderBase.typeDocument = 'document';
LoaderBase.typeVideo = 'video';
LoaderBase.typeAudio = 'audio';

export default LoaderBase;
