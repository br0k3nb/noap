import { Dispatch, ReactPortal, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  AiFillDelete,
  AiFillSave,
  AiOutlineClose
} from "react-icons/ai";

// import { GrClose } from "react-icons/gr";

import { Excalidraw } from "@excalidraw/excalidraw";
import { createPortal } from "react-dom";

import Button from "../../ui/Button";
import Modal from "../../ui/Modal";

import "./ExcalidrawModal.css";

export type ExcalidrawElementFragment = {
  isDeleted?: boolean;
};

type Props = {
  closeOnClickOutside?: boolean;
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ReadonlyArray<ExcalidrawElementFragment>;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (elements: ReadonlyArray<ExcalidrawElementFragment>) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
 */
export default function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  isShown = false,
  onDelete,
  setOpen,
}: Props): ReactPortal | null {
  const excaliDrawModelRef = useRef<HTMLDivElement | null>(null);

  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] = useState<ReadonlyArray<ExcalidrawElementFragment>>(initialElements);

  useEffect(() => {
    if (excaliDrawModelRef.current !== null) excaliDrawModelRef.current.focus();
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelRef.current !== null &&
        !excaliDrawModelRef.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        setOpen(false);
      }
    };

    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement?.addEventListener("click", clickOutsideHandler);
      }
    }

    return () => {
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onDelete]);

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (currentModalRef !== null) {
      currentModalRef.addEventListener("keydown", onKeyDown);
    }

    return () => {
      if (currentModalRef !== null) {
        currentModalRef.removeEventListener("keydown", onKeyDown);
      }
    };
  }, [elements, onDelete]);

  const save = () => {
    if (elements.filter((el) => !el.isDeleted).length > 0) onSave(elements);
    else onDelete();
  };

  const discard = () => {
    if (elements.filter((el) => !el.isDeleted).length === 0) {
      // delete node if the scene is clear
      onDelete();
    } else {
      //Otherwise, show confirmation dialog before closing
      setDiscardModalOpen(true);
    }
  };

  function ShowDiscardDialog(): JSX.Element {
    return (
      <Modal
        title="Delete"
        onClose={() => setDiscardModalOpen(false)}
        closeOnClickOutside={true}
      >
        <div className="w-[300px]">
          <p className="text-xs text-gray-300 uppercase tracking-widest">
            Are you sure you want to delete the node?
          </p>
          <div className="flex flex-row justify-around mt-6">
            <Button
              className="bg-gray-700 hover:!bg-red-700 transition-all duration-300 ease-in-out text-xs uppercase tracking-widest py-3"
              onClick={() => {
                setDiscardModalOpen(false);
                onDelete();
              }}
            >
              Delete
            </Button>{" "}
            <Button
              className="bg-gray-700 hover:!bg-gray-900 transition-all duration-300 ease-in-out text-xs uppercase tracking-widest py-3"
              onClick={() => setDiscardModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (isShown === false) return null;

  const onChange = (els: ReadonlyArray<ExcalidrawElementFragment>) => {
    setElements(els);
  };
    
  const _Excalidraw =
  //@ts-ignore
    Excalidraw.$$typeof != null ? Excalidraw : Excalidraw.default;

  return createPortal(
    <div className="ExcalidrawModal__overlay" role="dialog">
      <div
        className="ExcalidrawModal__modal xxs:!w-[screen] xxs:!h-screen"
        ref={excaliDrawModelRef}
        tabIndex={-1}
      >
        <div className="ExcalidrawModal__row xxs:!w-screen xxs:!h-screen">
          {discardModalOpen && <ShowDiscardDialog />}
          <_Excalidraw
            onChange={onChange}
            initialData={{
              appState: { isLoading: false },
              elements: initialElements,
            }}
          />
          <div className="ExcalidrawModal__actions">
            <button className="action-button" onClick={() => setOpen(false)}>
              <div className="flex flex-row space-x-2">
                <p className="text-[12.5px] uppercase tracking-wide">close</p>
                <AiOutlineClose className="mt-[1px]"/>
              </div>
            </button>
            <button className="action-button" onClick={discard}>
              <div className="flex flex-row space-x-2">
                <p className="text-[12.5px] uppercase tracking-wide">delete</p>
                <AiFillDelete className="mt-[1px]"/>
              </div>
            </button>
            <button className="action-button" onClick={save}>
              <div className="flex flex-row space-x-2">
                <p className="text-[12.5px] uppercase tracking-wide">save</p>
                <AiFillSave className="mt-[1px]"/>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}