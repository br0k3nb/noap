import { CAN_USE_DOM } from './canUseDOM';

const getSelection = () => CAN_USE_DOM ? window.getSelection() : null;

export default getSelection;