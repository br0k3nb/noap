import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  createContext,
  RefObject,
  ReactNode,
  MouseEvent,
  Ref
} from "react";
import { createPortal } from "react-dom";

type DropDownContextType = {
  registerItem: (ref: RefObject<HTMLButtonElement>) => void;
};

const DropDownContext = createContext<DropDownContextType | null>(null);

export function DropDownItem({
  children,
  className,
  onClick,
  title,
}: {
  children: ReactNode;
  className: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const dropDownContext = useContext(DropDownContext);

  if (dropDownContext === null) {
    throw new Error("DropDownItem must be used within a DropDown");
  }

  const { registerItem } = dropDownContext;

  useEffect(() => {
    if (ref && ref.current) registerItem(ref);
  }, [ref, registerItem]);

  return (
    <button className={className} onClick={onClick} ref={ref} title={title} type="button">
      {children}
    </button>
  );
}

function DropDownItems({
  children,
  dropDownRef,
  onClose,
  modalClassName
}: {
  children: ReactNode;
  modalClassName?: string;
  dropDownRef: Ref<HTMLDivElement>;
  onClose: () => void;
}) {
  const [ items, setItems ] = useState<React.RefObject<HTMLButtonElement>[]>();
  const [ highlightedItem, setHighlightedItem ] = useState<React.RefObject<HTMLButtonElement>>();

  const registerItem = useCallback(
    (itemRef: React.RefObject<HTMLButtonElement>) => {
      setItems((prev) => (prev ? [...prev, itemRef] : [itemRef]));
    },
    [setItems],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!items) return;

    const key = event.key;

    if (["Escape", "ArrowUp", "ArrowDown", "Tab"].includes(key)) event.preventDefault();

    if (key === "Escape" || key === "Tab") onClose();
    else if (key === "ArrowUp") {
      setHighlightedItem((prev) => {
        if (!prev) return items[0];
        const index = items.indexOf(prev) - 1;

        return items[index === -1 ? items.length - 1 : index];
      });
    } else if (key === "ArrowDown") {
      setHighlightedItem((prev) => {
        if (!prev) return items[0];

        return items[items.indexOf(prev) + 1];
      });
    }
  };

  const contextValue = useMemo(
    () => ({registerItem}),
    [registerItem]
  );

  useEffect(() => {
    if (items && !highlightedItem) setHighlightedItem(items[0]);
    if (highlightedItem && highlightedItem.current) highlightedItem.current.focus();
  }, [items, highlightedItem]);

  return (
    <DropDownContext.Provider value={contextValue}>
      <div 
        className={`dropdown-lexical ${modalClassName && modalClassName} !border !border-gray-500`} 
        ref={dropDownRef} 
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </DropDownContext.Provider>
  );
}

export default function DropDown({
  disabled = false,
  buttonLabel,
  buttonLabelClassName,
  useCustomButton,
  buttonClassName,
  modalClassName,
  customButtonLabel,
  buttonIconClassName,
  children,
  stopCloseOnClickSelf,
}: {
  disabled?: boolean;
  buttonAriaLabel?: string;
  buttonClassName: string;
  modalClassName?: string;
  useCustomButton?: any;
  buttonIconClassName?: string;
  buttonLabelClassName?: string;
  customButtonLabel?: any;
  buttonLabel?: string;
  children: ReactNode;
  stopCloseOnClickSelf?: boolean;
}): JSX.Element {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<any>(null);
  const [ showDropDown, setShowDropDown ] = useState(false);

  const handleClose = () => {
    setShowDropDown(false);
    if (buttonRef && buttonRef.current) buttonRef.current.focus();
  };

  useEffect(() => {
    const button = buttonRef.current;
    const dropDown = dropDownRef.current;

    if (showDropDown && button !== null && dropDown !== null) {
      const { top, left } = button.getBoundingClientRect();

      const usingCustomButton = `${Math.min(left, window.innerWidth - dropDown.offsetWidth - 20) - 9}px`;
      const usingDefaultButton = `${Math.min(left, window.innerWidth - dropDown.offsetWidth - 20)}px`;

      dropDown.style.top = `${top + 40}px`;
      dropDown.style.left = useCustomButton ? usingCustomButton : usingDefaultButton;
    }
  }, [dropDownRef, buttonRef, showDropDown]);

  useEffect(() => {
    const button = buttonRef.current;

    if (button !== null && showDropDown) {
      const handle = (event: MouseEvent) => {
        const target = event.target;
        if (stopCloseOnClickSelf) {
          if (dropDownRef.current && dropDownRef.current.contains(target as Node)) return;
        }
        if (!button.contains(target as Node)) setShowDropDown(false);
      };
      //@ts-ignore
      document.addEventListener('click', handle);
      //@ts-ignore
      return () => document.removeEventListener('click', handle);
    }
  }, [dropDownRef, buttonRef, showDropDown, stopCloseOnClickSelf]);

  return (
    <>
      {!useCustomButton ? (
        <button
          disabled={disabled}
          className={buttonClassName}
          onClick={() => setShowDropDown(!showDropDown)}
          ref={buttonRef}
        >
          {buttonIconClassName && <span className={buttonIconClassName} />}
          {buttonLabel && 
            <span 
              className={`text dropdown-button-text ${buttonLabelClassName && buttonLabelClassName}`}
            >
              {buttonLabel}
            </span>
          }
          <i className="chevron-down comp-picker" />
        </button>
      ) : (
        <button 
          className="border border-gray-600 hover:!border-gray-400 rounded-lg h-8 my-auto hover:bg-[#dfe8fa4d]"
          onClick={() => setShowDropDown(!showDropDown)}
          ref={buttonRef}
        >
          <div className="my-1 mr-1 text-gray-200">
            {(buttonLabel && !customButtonLabel) ? (
              <span 
                className={`text !px-2  ${buttonLabelClassName && buttonLabelClassName}`}
              >
                {buttonLabel}
              </span>
            ) : customButtonLabel}
          </div>
        </button>
      )}

      {showDropDown &&
        createPortal(
          <DropDownItems 
            modalClassName={modalClassName} 
            dropDownRef={dropDownRef} 
            onClose={handleClose}
          >
            {children}
          </DropDownItems>,
          document.body,
        )}
    </>
  );
}