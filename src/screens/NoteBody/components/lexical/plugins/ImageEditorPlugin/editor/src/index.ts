import '../src/js/polyfill';
import ImageEditor from '../src/js/imageEditor';
import '../src/css/index.styl';

// commands
import '../src/js/command/addIcon';
import '../src/js/command/addImageObject';
import '../src/js/command/addObject';
import '../src/js/command/addShape';
import '../src/js/command/addText';
import '../src/js/command/applyFilter';
import '../src/js/command/changeIconColor';
import '../src/js/command/changeShape';
import '../src/js/command/changeText';
import '../src/js/command/changeTextStyle';
import '../src/js/command/clearObjects';
import '../src/js/command/flip';
import '../src/js/command/loadImage';
import '../src/js/command/removeFilter';
import '../src/js/command/removeObject';
import '../src/js/command/resizeCanvasDimension';
import '../src/js/command/rotate';
import '../src/js/command/setObjectProperties';
import '../src/js/command/setObjectPosition';
import '../src/js/command/changeSelection';
import '../src/js/command/resize';

export default ImageEditor;
export { ImageEditor };
