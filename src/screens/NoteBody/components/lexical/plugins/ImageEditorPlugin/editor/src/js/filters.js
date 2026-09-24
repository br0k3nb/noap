import * as fabric from 'fabric';
import Mask from './extension/mask';
import Sharpen from './extension/sharpen';
import Emboss from './extension/emboss';
import ColorFilter from './extension/colorFilter';

const filters = {
  ...fabric.filters,
  Mask,
  Sharpen,
  Emboss,
  ColorFilter,
};

export default filters;
