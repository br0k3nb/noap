import * as fabric from 'fabric';
import { createFabricClass } from '../fabric';

/**
 * Blur object
 * @class Blur
 * @extends {fabric.filters.Convolute}
 * @ignore
 */
const Blur = createFabricClass(
  fabric.filters.Convolute,
  /** @lends Convolute.prototype */ {
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Blur',

    /**
     * constructor
     * @override
     */
    initialize() {
      this.matrix = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
    },
  }
);

export default Blur;
