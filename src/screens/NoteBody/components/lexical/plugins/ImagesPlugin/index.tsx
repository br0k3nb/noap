import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalEditor,
} from "lexical";

import Compressor from 'compressorjs';
import imageCompression from 'browser-image-compression';

import { BsLink, BsFillFolderSymlinkFill } from 'react-icons/bs';

import { CAN_USE_DOM } from "../../shared/canUseDOM";
  
import { $createImageNode, $isImageNode, ImageNode, ImagePayload } from "../../nodes/ImageNode";
import Button from "../../ui/Button";
import { DialogButtonsList } from "../../ui/Dialog";
import FileInput from "../../ui/FileInput";
import TextInput from "../../ui/TextInput";

import { toastAlert } from "../../../../../../components/Alert";
import Modal from "../../../../../../components/Modal";

import useSaveNote from "../../../../../../hooks/useSaveNote";

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

type InsertImageDialogBodyType = {
  onClick: (payload: InsertImagePayload) => void;
};

export function InsertImageUriDialogBody({ onClick }: InsertImageDialogBodyType) {
  const [src, setSrc] = useState("");
  const [imageIsLoading, setImageIsLoading] = useState(true);
  const [urlIsAValidImage, setUrlIsAValidImage] = useState(false);

  useEffect(() => {
    const verifyIfImageIsValid = async () => {
      try {
        setImageIsLoading(true);

        const img = new Image();
        img.src = src;

        const result = await new Promise((resolve) => {
          img.onerror = () => resolve(false);
          img.onload = () => resolve(true);
        });

        setUrlIsAValidImage(result as boolean);
      } finally {
        setImageIsLoading(false);
      }
    };

    verifyIfImageIsValid();
  }, [src]);

  return (
    <div className="!mt-2 cursor-default pr-2 pl-3 xxs:!px-0 xxs:max-h-[400px] md:max-h-[500px] max-h-[600px] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
      <TextInput
        label="Image URL"
        placeholder="i.e. https://source.unsplash.com/random"
        onChange={setSrc}
        value={src}
        data-test-id="image-modal-url-input"
      />
      {urlIsAValidImage && (
        <>
          <p className="text-[13px] dark:text-gray-300 text-gray-900 uppercase my-5 tracking-widest">Preview image</p>
          <img
            src={src}
            className="max-w-[360px] xxs:max-w-[17rem] xxs:mx-auto"
            draggable={false}
          />
        </>
      )}
      <div className="w-full xxs:w-[275px] mx-auto mt-5">
        <button 
          className="my-3 text-white rounded-full bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full disabled:opacity-50 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
          disabled={!urlIsAValidImage && true}
          onClick={() => onClick({ src, altText: '' })}
        >
          {(imageIsLoading && src) ? (
            <p className="animate-pulse text-gray-300">Validating link...</p>
          ) : "Confirm"}
        </button>
      </div>
    </div>
  );
}

export function InsertImageUploadedDialogBody({ onClick }: InsertImageDialogBodyType) {
  const [src, setSrc] = useState("");
  const [loader, setLoader] = useState(false);

  const loadImage = (files: FileList | null) => {
    if(files && files[0].size <= 5006613 && files[0].type.startsWith("image")) { //aprox 5mb
      setLoader(true);
      new Compressor(files[0], {      
        quality: 0.3,
        success: async (compressedResult) => {
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          }
          try {
            const compressedFile = await imageCompression(compressedResult as File, options);
              const reader = new FileReader();
              reader.onload = async function () {
                if (typeof reader.result === "string") {
                  setLoader(false);
                  setSrc(reader.result);
                }
                return "";
              };
              reader.readAsDataURL(compressedFile);
          } catch (error) {
            console.log(error);
          }
        },
      });
    } else if(files && !files[0].type.startsWith("image")) {
      toastAlert({ icon: "error", title: `Only images are supported!`, timer: 3000 });
    } else {
      toastAlert({ icon: "error", title: `Image too large!`, timer: 3000 });
    }
  };

  return (
    <div
      className={`
        cursor-default pr-2 pl-3 xxs:!px-0 ${src && "xxs:max-h-[400px] md:max-h-[500px] max-h-[600px] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300"}`
      }
    >
      <div className="w-[360px] xxs:w-[275px] mx-auto">
        <FileInput
          label="Upload image"
          onChange={loadImage}
          accept="image/*"
          data-test-id="image-modal-file-upload"
          inputWrapperClassName="w-[360px]"
        />
      </div>
      {src && (
        <>
          <p className="text-xs dark:text-gray-300 text-gray-900 uppercase my-5 tracking-widest">Preview image</p>
          <img
            src={src}
            alt="Selected image"
            className="max-w-[360px] xxs:max-w-[17rem] xxs:mx-auto"
            draggable={false}
          />
        </>
      )}
      <div className="w-full xxs:w-[275px] mx-auto mt-5">
        <button 
          className="my-3 text-white rounded-full bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full disabled:opacity-50 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
          disabled={(!src || loader) && true}
          onClick={() => onClick({ src, altText: '' })}
        >
          {loader ? (
            <p className="animate-pulse text-gray-300">Loading...</p>
          ) : "Confirm"}
        </button>
      </div>
    </div>
  );
}

type InsertImageModalType = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  activeEditor: LexicalEditor;
}

export function InsertImageModal({ setOpen, activeEditor }: InsertImageModalType) {
  const [mode, setMode] = useState<null | "url" | "file">(null);
  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => hasModifier.current = e.altKey;

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [activeEditor]);

  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    setOpen(false);
  };

  return (
    <Modal
      open={true}
      setOpen={setOpen}
      title="Insert image"
      options={{
        modalWrapperClassName: `${mode ? "w-[27.2rem]" : "w-[22rem]"} xxs:!w-[21.5rem] !px-0 overflow-y-hidden`,
        titleWrapperClassName: "!px-6",
        showGoBackButton: mode ? true : false,
        goBackButtonAction: () => setMode(null),
      }}
    >
      <div className="px-6 mt-5">
        {!mode && (
          <DialogButtonsList>
            <Button
              data-test-id="image-modal-option-url"
              className="bg-[#dbdbdb] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#cecece] text-gray-900 border border-stone-400 dark:border-[#404040] dark:text-gray-300 transition-all ease-in-out duration-300 uppercase text-[14px] tracking-widest flex items-center justify-center"
              onClick={() => setMode("url")}
            >
              <div className="flex w-[54px] justify-between">
                <span>URL</span> 
                <BsLink size={20} />
              </div>
            </Button>
            <Button
              data-test-id="image-modal-option-file"
              className="!mb-2 bg-[#dbdbdb] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#cecece] text-gray-900 border border-stone-400 dark:border-[#404040] dark:text-gray-300 transition-all ease-in-out duration-300 uppercase text-[14px] tracking-widest flex items-center justify-center"
              onClick={() => setMode("file")}
            >
              <div className="flex w-[55px] justify-between">
                <span>File</span> 
                <BsFillFolderSymlinkFill size={17} className="mt-[2px]" />
              </div>
            </Button>
          </DialogButtonsList>
        )}
        {mode === "url" && <InsertImageUriDialogBody onClick={onClick} />}
        {mode === "file" && <InsertImageUploadedDialogBody onClick={onClick} />}
      </div>
    </Modal>
  )
}

type ImagesPlugin = {
  captionsEnabled?: boolean;
}

export default function ImagesPlugin({ captionsEnabled } : ImagesPlugin): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const { saveNoteFn } = useSaveNote();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          setTimeout(() => saveNoteFn(editor.getEditorState()), 2500);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => onDragStart(event),
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => onDragover(event),
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => onDrop(event, editor),
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [captionsEnabled, editor]);

  return null;
}

const TRANSPARENT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const img = document.createElement("img");
img.src = TRANSPARENT_IMAGE;

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) return false;

  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return false;

  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(img, 0, 0);
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    })
  );

  return true;
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) return false;
  if (!canDropImage(event)) event.preventDefault();

  return true;
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection();
  if (!node) return false;

  const data = getDragImageData(event);
  if (!data) return false;

  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();

    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }

    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }

  return true;
}

function getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) return null;

  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");
  if (!dragData) return null;

  const { type, data } = JSON.parse(dragData);
  if (type !== "image") return null;

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;

  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest("code, span.editor-image") &&
    target.parentElement &&
    target.parentElement.closest("div.ContentEditable__root")
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;

  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
      ? (target as Document).defaultView
      : (target as Element).ownerDocument.defaultView;

  const domSelection = getDOMSelection(targetWindow);

  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else throw Error(`Cannot get the selection when dragging`);

  return range;
}