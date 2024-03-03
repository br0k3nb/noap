import { useEffect } from "react";

export default function useEvent(
  htmlElement: HTMLElement,
  eventType: keyof HTMLElementEventMap,
  actionFn: (e: Event) => any,
  customCleanUpFn?: () => any
) {
  useEffect(() => {
    if(htmlElement) {
      htmlElement.addEventListener(eventType, actionFn, false);
  
      if (customCleanUpFn) return () => customCleanUpFn();
      return () => htmlElement.removeEventListener(eventType, actionFn);
    }
  }, [htmlElement]);
}
