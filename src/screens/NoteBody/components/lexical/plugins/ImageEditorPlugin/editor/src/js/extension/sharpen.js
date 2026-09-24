import * as fabric from 'fabric';
import { createFabricClass } from '../fabric';

/**
 * Sharpen object
 * @class Sharpen
 * @extends {fabric.filters.Convolute}
 * @ignore
 */
const Sharpen = createFabricClass(
  fabric.filters.Convolute,
  /** @lends Convolute.prototype */ {
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Sharpen',

    /**
     * constructor
     * @override
     */
    initialize() {
      this.matrix = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    },
  }
);

export default Sharpen;
