import LoaderBase from './LoaderBase';

/**
 * LoaderJSON will load a JSON file and parse its content. The content property will contain an Object
 * representation of the JSON data.
 *
 * @class LoaderJSON
 * @constructor
 * @extends {LoaderBase}
 */
class LoaderJSON extends LoaderBase {
  constructor(options) {
    super(LoaderBase.typeJSON, options);
  }
}

export default LoaderJSON;
