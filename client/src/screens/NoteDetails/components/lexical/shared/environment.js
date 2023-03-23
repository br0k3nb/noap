import { CAN_USE_DOM } from "./canUseDOM";

const documentMode =
  CAN_USE_DOM && "documentMode" in document ? document.documentMode : null;

export const IS_APPLE =
  CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const IS_FIREFOX =
  CAN_USE_DOM && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);

export const CAN_USE_BEFORE_INPUT =
  CAN_USE_DOM && "InputEvent" in window && !documentMode
    ? "getTargetRanges" in new window.InputEvent("input")
    : false;

export const IS_SAFARI =
  CAN_USE_DOM && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);

export const IS_IOS =
  CAN_USE_DOM &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;