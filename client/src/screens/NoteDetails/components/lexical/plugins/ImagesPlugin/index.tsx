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
import { useEffect, useRef, useState } from "react";

import Compressor from 'compressorjs';
import imageCompression from 'browser-image-compression';

import { BsLink, BsFillFolderSymlinkFill } from 'react-icons/bs';

import { CAN_USE_DOM } from "../../shared/canUseDOM";
  
import { $createImageNode, $isImageNode, ImageNode, ImagePayload } from "../../nodes/ImageNode";
import Button from "../../ui/Button";
import { DialogActions, DialogButtonsList } from "../../ui/Dialog";
import FileInput from "../../ui/FileInput";
import TextInput from "../../ui/TextInput";

import { toastAlert } from "../../../../../../components/Alert";
import SvgLoader from "../../../../../../components/SvgLoader";

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND =
  createCommand("INSERT_IMAGE_COMMAND");

export function InsertImageUriDialogBody({ onClick }: { onClick: (payload: InsertImagePayload) => void }) {
  const [src, setSrc] = useState("");

  const isDisabled = src === "";

  return (
    <>
      <TextInput
        label="Image URL"
        placeholder="i.e. https://source.unsplash.com/random"
        onChange={setSrc}
        value={src}
        data-test-id="image-modal-url-input"
      />
      <DialogActions>
        <Button
          className="bg-[#dbdbdb] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#cecece] text-gray-900 border border-stone-400 dark:border-[#404040] dark:text-gray-300 transition-all duration-300 ease-in-out !text-sm uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed disabled:!bg-gray-700/60"
          data-test-id="image-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() => onClick({ src, altText: '' })}
        >
          <p className="py-[3px]">Confirm</p>
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertImageUploadedDialogBody({ onClick }: { onClick: (payload: InsertImagePayload) => void }) {
  const [src, setSrc] = useState("");
  const [loader, setLoader] = useState(false);

  const isDisabled = src === "";

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
    <div className="w-[320px] xxs:w-[275px]">
      <FileInput 
        label="Upload image"
        onChange={loadImage} 
        accept="image/*"
        data-test-id="image-modal-file-upload"
      />
      <DialogActions>
        {loader ? ( <SvgLoader options={{ showLoadingText: true, wrapperClassName: "bg-gray-700 py-3 px-3 rounded-lg" }}/>) : (
          <Button
            className="bg-[#dbdbdb] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#cecece] text-gray-900 border border-stone-400 dark:border-[#404040] dark:text-gray-300 transition-all duration-300 ease-in-out !text-sm uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed disabled:!bg-gray-700/60"
            data-test-id="image-modal-file-upload-btn"
            disabled={isDisabled}
            onClick={() => onClick({ src, altText: '' })}
          >
            <p className="py-[3px]">Confirm</p>
          </Button>
        )}
      </DialogActions>
    </div>
  );
}

export function InsertImageDialog({ activeEditor, onClose }: { activeEditor: LexicalEditor; onClose: () => void; }) {
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
    onClose();
  };

  return (
    <>
      {!mode && (
        <DialogButtonsList
          customClassName={"!mt-1 !mb-0"}
        >
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
    </>
  );
}

export default function ImagesPlugin({captionsEnabled} : {captionsEnabled?: boolean}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

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
        maxWidth: node.__maxWidth,
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