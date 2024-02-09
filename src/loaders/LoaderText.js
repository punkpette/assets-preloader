import LoaderBase from './LoaderBase';

/**
 * LoaderText will load a file and the content saved in this Loader will be a String.
 *
 * @class LoaderText
 * @constructor
 * @extends {LoaderBase}
 */
class LoaderText extends LoaderBase {
  constructor(options) {
    super(LoaderBase.typeText, options);
  }
}

export default LoaderText;
