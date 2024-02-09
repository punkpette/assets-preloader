import LoaderBase from './LoaderBase';
import LoaderVideo from './LoaderVideo';

/**
 * LoaderAudio will load an audio file. The content property will contain an audio tag.
 */
export default class LoaderAudio extends LoaderVideo {
  /**
   * Constructor for LoaderAudio class.
   * @param {Object} options Options for the loader
   */
  constructor(options) {
    super(options);
    this.loadType = LoaderBase.typeAudio;
  }
}
