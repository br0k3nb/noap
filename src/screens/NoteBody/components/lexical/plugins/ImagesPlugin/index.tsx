import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from "react";

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
import { FaRegSave } from "react-icons/fa";

import { CAN_USE_DOM } from "../../shared/canUseDOM";
  
import { $createImageNode, $isImageNode, ImageNode, ImagePayload } from "../../nodes/ImageNode";
import Button from "../../ui/Button";
import { DialogButtonsList } from "../../ui/Dialog";
import FileInput from "../../ui/FileInput";
import TextInput from "../../ui/TextInput";

import { toastAlert } from "../../../../../../components/Alert";
import Modal from "../../../../../../components/Modal";
import ConfirmationModal from "../../../../../../components/ConfirmationModal";

import ImageEditor from '../ImageEditorPlugin/';
import TuiImageEditor from '../ImageEditorPlugin/editor/src';

import useSaveNote from "../../../../../../hooks/useSaveNote";

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

type InsertImageDialogBodyType = {
  onClick: (payload: InsertImagePayload) => void;
  setSrc: Dispatch<SetStateAction<string>>;
  setMode: Dispatch<SetStateAction<"url" | "file" | "edit" | null>>;
  src: string;
};

type InsertImageUriDialogBodyType = {
  onClick: (payload: InsertImagePayload) => void;
}

type ImagesPlugin = {
  captionsEnabled?: boolean;
}

type InsertImageModalType = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  activeEditor: LexicalEditor;
}

export function InsertImageUriDialogBody({ onClick }: InsertImageUriDialogBodyType) {
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

export function InsertImageUploadedDialogBody({ onClick, src, setSrc, setMode }: InsertImageDialogBodyType) {
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
    <div className="cursor-default pr-2 pl-3 xxs:!px-0">
      <div className={`mx-auto ${src ? "w-[650px] xxs:w-[275px]" : "w-[330px] xxs:w-[275px]"}`}>
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
            className="max-w-[650px] xxs:max-w-[17rem] xxs:mx-auto"
            draggable={false}
          />
        </>
      )}
      {src && (
        <div className="w-full xxs:w-[275px] mx-auto mt-5">
          <button 
            className="border border-gray-700 text-black dark:text-white rounded-full hover:tracking-widest transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loader && true}
            onClick={() => setMode('edit')}
          >
            {loader ? (
              <p className="animate-pulse text-gray-300">Loading...</p>
            ) : "edit image"}
          </button>
        </div>
      )}
      <div className={`w-full xxs:w-[275px] mx-auto ${!src && "mt-5"}`}>
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

export function InsertImageModal({ setOpen, activeEditor }: InsertImageModalType) {
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [imageEditorInstance, setImageEditorInstance] = useState<TuiImageEditor | null>(null);
  const [mode, setMode] = useState<null | "url" | "file" | "edit">(null);
  const [src, setSrc] = useState("");

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

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.keyCode === 27) setOpenConfirmationModal(true);
  };

  return (
    <Modal
      open={true}
      setOpen={setOpen}
      title={`${mode === 'edit' ? 'Edit image' : 'Insert image'}`}
      options={{
        modalWrapperClassName: `${((mode === 'file' && src) || mode === 'url') ? "w-[45rem] !max-w-none" : mode === 'edit' ? 'w-full !h-full !max-h-none !max-w-none rounded-none' : "w-[25rem]"} xxs:!w-[21.5rem] !px-0 overflow-y-hidden`,
        titleWrapperClassName: "!px-6",
        showGoBackButton: mode ? true : false,
        goBackButtonAction: () => {
          setMode(mode === 'edit' ? 'file' : null);
          if(mode === "file") setSrc('');
        },
        customKeyboardPressHandler: (e) => handleKeyPress(e),
        customTopActionButton: (
          <EditButton
            mode={mode}
            saveFn={onClick}
            setMode={setMode}
            setOpen={setOpen}
            setSrc={setSrc}
            imageEditorInstance={imageEditorInstance}
          />
        )
      }}
    >
      {(openConfirmationModal && mode === 'edit') && (
        <ConfirmationModal
          mainText="Are you sure you want to leave the editor ?"
          open={openConfirmationModal}
          setOpen={setOpenConfirmationModal}
          options={{
            actionButtonText: "Close",
            cancelButtonText: "Keep editing",
            subText: "All unsaved changes will be lost!",
            subTextClassName: "px-6",
            actionButtonsWrapperClassName: "border border-transparent border-t-[#4b5563] pt-4",
            modalWrapperClassName: "!pb-[15px]"
          }}
          actionButtonFn={() => {
            setOpenConfirmationModal(false);
            setOpen(false);
          }}
        />
      )}
      {mode !== 'edit' ? (
        <div className={`px-6 pt-5 pb-3 ${src && "xxs:max-h-[400px] md:max-h-[500px] !max-h-[800px] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300"}`}>
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
          {mode === "file" && <InsertImageUploadedDialogBody onClick={onClick} src={src} setSrc={setSrc} setMode={setMode} />}
        </div>
      ) : (
        <div style={{ height: innerHeight - 80 }}>
          <ImageEditor
            editorInstance={imageEditorInstance}
            setEditorInstance={setImageEditorInstance}
            includeUI={{
              loadImage: { path: src, name: 'image' },
              menuBarPosition: 'right',
              theme: { 'common.bisize.width': '0px', 'common.bisize.height': '0px' }
            }}
            usageStatistics={false}
          />
        </div>
      )}
    </Modal>
  )
}

type EditButtonType = {
  mode: null | "url" | "file" | "edit"; 
  saveFn: (payload: InsertImagePayload) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setMode: Dispatch<SetStateAction<"url" | "file" | "edit" | null>>;
  setSrc: Dispatch<SetStateAction<string>>;
  imageEditorInstance: TuiImageEditor | null;
}

type eventHandlerType = {
  download: () => string;
}

export function EditButton ({ mode, saveFn, setOpen, setMode, setSrc, imageEditorInstance } : EditButtonType) {
  const handleClick = () => {
    if(imageEditorInstance && (imageEditorInstance.ui?.eventHandler as eventHandlerType).download) {
      const src = (imageEditorInstance.ui?.eventHandler as eventHandlerType).download();

      saveFn({ src, altText: '' });
      setOpen(false);
      setMode(null);
      setSrc('');
    }
  }

  return (
    <div 
      className={`transition-all duration-300 ease-in-out hover:tracking-wide bg-[#ffffff] border border-gray-500 text-gray-900 dark:text-gray-200 px-3 rounded-full bg-inherit hover:bg-green-700 py-1 ${mode !== "edit" && "!hidden"}`}
      onClick={() => handleClick()}
    >
      <button
        id="tui-image-editor-download-btn"
        className="bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out hover:tracking-widest border hover border-[#4b5563] px-3 dark:text-white text-black tracking-wide text-[17px] rounded-full"
      >
        <div className="flex flex-row space-x-2 text-[13.5px] uppercase">
          <p>Save image</p>
          <FaRegSave size={19} />
        </div>
      </button>
    </div>
  )
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
            //@ts-ignore
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