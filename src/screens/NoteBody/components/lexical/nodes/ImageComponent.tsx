import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import type {
  BaseSelection,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
} from 'lexical';

import "./ImageNode.css";

import { EmojiNode } from './EmojiNode';
import { KeywordNode } from './KeywordNode';
import { HashtagNode } from '@lexical/hashtag';
import { LinkNode } from '@lexical/link';
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  LineBreakNode,
  ParagraphNode,
  RootNode,
  TextNode,
} from 'lexical';

import { motion } from "framer-motion";

import { BsTrash, BsThreeDotsVertical, BsFillFileEarmarkArrowDownFill } from 'react-icons/bs';
import { AiOutlineFullscreen } from 'react-icons/ai';
import { RiImageEditLine } from "react-icons/ri";

import { createWebsocketProvider } from "../collaboration";
import { useSharedHistoryContext } from "../context/SharedHistoryContext";
import EmojisPlugin from "../plugins/EmojisPlugin";
import KeywordsPlugin from "../plugins/KeywordsPlugin";
import LinkPlugin from "../plugins/LinkPlugin";
import MentionsPlugin from "../plugins/MentionsPlugin";
import ContentEditable from "../ui/ContentEditable";
import ImageResizer from "../ui/ImageResizer";
import Placeholder from "../ui/Placeholder";
import { $isImageNode, ImageNode } from "./ImageNode";

import Modal from "../../../../../components/Modal";
import EditImageModal from "../plugins/ImageEditorPlugin/EditImageModal";

import useUpdateViewport from "../../../../../hooks/useUpdateViewport";

import type { InsertImagePayload } from "../plugins/ImagesPlugin";

const imageCache = new Set();
export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand('RIGHT_CLICK_IMAGE_COMMAND');
export const UPDATE_IMAGE_COMMAND: LexicalCommand<any> = createCommand('UPDATE_IMAGE_COMMAND');

function useSuspenseImage(src: string) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
}

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxHeight
}: {
  altText?: string;
  className?: string | null;
  height: "inherit" | number;
  imageRef?: { current: null | HTMLImageElement };
  src: string;
  width: number;
  maxHeight?: number | string;
}): JSX.Element {
  useSuspenseImage(src);
  const rootEditorEl = document.getElementById("ContentEditable__root") as HTMLDivElement;
  const { width: clientWidth } = rootEditorEl.getBoundingClientRect();

  const newWidth = width > (clientWidth - 56) ? width - (Math.abs((clientWidth - 56) - width) + 70) : width;

  return (
    <img
      className={className || ''}
      src={src}
      alt={altText}
      ref={imageRef}
      style={{ 
        height, 
        maxWidth: innerWidth <= 640 ? clientWidth - 53 : newWidth,
        width: newWidth, 
        maxHeight: maxHeight ? maxHeight : '' 
      }}
      draggable="false"
    />
  );
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  resizable,
  showCaption,
  caption,
  captionsEnabled,
  isAExcalidrawImage
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  caption?: LexicalEditor;
  captionsEnabled: boolean;
  width: number;
  height: "inherit" | number;
  isAExcalidrawImage?: boolean
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const { isCollabActive } = useCollaborationContext();
  const [editor] = useLexicalComposerContext();

  const [hover, setHover] = useState(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [openFullscreenModal, setOpenFullscreenModal] = useState(false);
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const [currentScreenSize, setCurrentScreenSize] = useState({ width: innerWidth, height: innerHeight });
  const [openEditImageModal, setOpenEditImageModal] = useState(false);

  useUpdateViewport(setCurrentScreenSize, 500);

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);

        if ($isImageNode(node)) node.remove();
        setSelected(false);
      }
      return false;
    },
    [isSelected, nodeKey, setSelected]
  );

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          // Move focus into nested editor
          $setSelection(null);
          event.preventDefault();
          if(caption) caption.focus();
          return true;
        } else if (
          buttonElem !== null &&
          buttonElem !== document.activeElement
        ) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [caption, isSelected, showCaption],
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (
        activeEditorRef.current === caption ||
        buttonRef.current === event.target
      ) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected],
  );

  const onMouseClick = (payload: MouseEvent) => {
    const event = payload;
    
    if((event.target as any)?.id && (event.target as any)?.id === 'delete') {
      const ev = new KeyboardEvent('keypress', { key: 'Delete', keyCode: 46 });
      $onDelete(ev);
    }

    if (isResizing) return true;

    if (event.target === imageRef.current) {
      if (event.shiftKey) setSelected(!isSelected);
      else {
        clearSelection();
        setSelected(true);
      }
      
      return true;
    }

    return false;
  };

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload;

      if (isResizing) {
        return true;
      }
      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [isResizing, isSelected, setSelected, clearSelection],
  );

  const onRightClick = useCallback(
    (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target as HTMLElement;
        if (
          domElement.tagName === 'IMG' &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(
            RIGHT_CLICK_IMAGE_COMMAND,
            event as MouseEvent,
          );
        }
      });
    },
    [editor],
  );

  const onImageUpdate = useCallback((payload: string) => {
    if(payload) {
      const node = $getNodeByKey(nodeKey);
      
      if (node && $isImageNode(node)) {
        const imageNode = node as ImageNode
        imageNode.setSrc(payload);
      }
    } 
    return false;
  }, [nodeKey])

  useEffect(() => {
    let isMounted = true;
    const rootElement = editor.getRootElement();

    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) setSelection(editorState.read(() => $getSelection()));
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        UPDATE_IMAGE_COMMAND,
        onImageUpdate,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW)
    );

    rootElement?.addEventListener('contextmenu', onRightClick);

    return () => {
      isMounted = false;
      unregister();
      rootElement?.removeEventListener('contextmenu', onRightClick);
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    $onDelete,
    $onEnter,
    $onEscape,
    onClick,
    onRightClick,
    setSelected,
  ]);

  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) node.setShowCaption(true);
    });
  };  

  const onResizeEnd = (nextWidth: "inherit" | number, nextHeight: "inherit" | number) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => setIsResizing(false), 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      const rootEditorDiv = document.getElementsByClassName("ContentEditable__root")[0];
      const editorWidth = rootEditorDiv.clientWidth;
     
      if ($isImageNode(node)) {
        if(nextWidth !== 'inherit' && editorWidth < nextWidth) node.setWidthAndHeight(editorWidth, nextHeight);
        else node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => setIsResizing(true);

  const { historyState } = useSharedHistoryContext();

  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = isSelected || isResizing;

  const donwloadImage = (srcLink: string) => {
    const a = Object.assign(document.createElement("a"), { 
      href: srcLink, 
      style:"display:none", 
      download: "image" 
    });
    
    document.body.appendChild(a);

    a.click();
    a.remove();
  };

  const dispatchImageUpdateEvent = ({ src }: InsertImagePayload) => {
    if(src) editor.dispatchCommand(UPDATE_IMAGE_COMMAND, src);
  }

  const resizeBar = typeof width === "number" && width <= 257;
  const defaultStyle = "z-10 !rounded-lg !object-cover xxs:!max-h-96 xxs:!w-screen sm:!max-h-96 xl:!object-fill xl:!max-h-screen";

  return (
    <Suspense fallback={"loading..."}>
      <Modal 
        open={openFullscreenModal} 
        setOpen={setOpenFullscreenModal}
        options={{
          titleWrapperClassName: "!border-none absolute right-1 top-1",
          modalWrapperClassName: "!max-w-fit border border-gray-600 overflow-x-hidden",
          closeButtonClassName: "!border-none"
        }}
      >
        <LazyImage
          src={src}
          maxHeight={currentScreenSize.width <= 640 ? currentScreenSize.height - 220 : currentScreenSize.height - 250}
          height={'inherit'}
          className={"!rounded-xl mt-6"}
          width={currentScreenSize.width - 100}
        />
      </Modal>
      <EditImageModal
        image={src}
        open={openEditImageModal}
        setOpen={setOpenEditImageModal}
        onImageEdit={({ src, altText }) => dispatchImageUpdateEvent({ src, altText })}
      />
      <div 
        onMouseEnter={() => setHover(true)} 
        onMouseLeave={() => setHover(false)}
      >
        <div draggable={draggable} className="!object-cover !rounded-lg !relative">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3  }}
              className={`cursor-pointer !absolute -top-0 -right-0 !w-8 bg-[#ffffff] dark:bg-[#181818] text-gray-900 dark:text-gray-300 rounded-bl-lg rounded-tr-lg h-8 hidden ${hover && '!inline'}`}
            >
              <div className="flex flex-row space-x-2 px-2 pt-1 justify-between">  
                <div className="dropdown dropdown-left">
                  <label 
                    tabIndex={0}
                    className={`text-[11px] uppercase tracking-widest cursor-pointer`}
                    style={resizeBar ? { fontSize: 10, paddingTop: 1 }: undefined}
                    onMouseEnter={() => setSelected(true)}
                  >
                    <div className="rounded-full py-1 pl-[1px]">
                      <BsThreeDotsVertical 
                        size={15}
                        style={resizeBar ? { paddingTop: 2 } : undefined} 
                      />
                    </div>
                  </label>
                  <ul 
                    tabIndex={0} 
                    className="dropdown-content menu shadow rounded-box w-[158px] bg-[#ffffff] dark:bg-[#181818] !text-gray-900 border border-gray-900"
                  >
                    {/* <li className="text-xs uppercase tracking-widest">
                      <a className="active:!bg-gray-trasparent hover:cursor-not-allowed bg-gray-700/70">Move up</a>
                    </li>
                    <li className="text-xs uppercase tracking-widest">
                      <a className="active:!bg-gray-trasparent hover:cursor-not-allowed bg-gray-700/70">Move down</a>
                    </li> */}
                     <li className="text-xs uppercase tracking-widest">
                      <a 
                        className="hover:!bg-[#e6e6e6] dark:hover:!bg-[#222222]"
                        onClick={() => setOpenEditImageModal(true)}
                      >
                        <div className="flex flex-row space-x-2 !text-gray-900 dark:!text-gray-300">
                          <span className="my-auto text-[11px] text-inherit">Edit</span>
                          <RiImageEditLine size={16}/>
                        </div>
                      </a>
                    </li>
                    <li className="text-xs uppercase tracking-widest">
                      <a 
                        className="hover:!bg-[#e6e6e6] dark:hover:!bg-[#222222]"
                        onClick={() => donwloadImage(src)}
                      >
                        <div className="flex flex-row space-x-2 !text-gray-900 dark:!text-gray-300">
                          <span className="my-auto text-[11px] text-inherit">Download</span>
                          <BsFillFileEarmarkArrowDownFill size={16}/>
                        </div>
                      </a>
                    </li>
                    <li className="text-xs uppercase tracking-widest">
                      <a 
                        className="active:!bg-gray-600 hover:!bg-[#e6e6e6] dark:hover:!bg-[#222222]"
                        onClick={() => setOpenFullscreenModal(true)}
                      >
                        <div className="flex flex-row space-x-2 !text-gray-900 dark:!text-gray-300">
                          <span className="my-auto text-[11px]">Fullscreen</span>
                          <AiOutlineFullscreen size={20}/>
                        </div>
                      </a>
                    </li>
                    {!isAExcalidrawImage && (
                      <li className="text-xs uppercase tracking-widest">
                        <a
                          id="delete"
                          className="active:!bg-gray-600 hover:!bg-[#e6e6e6] dark:hover:!bg-[#222222]"
                          onClick={() => setSelected(true)}
                        >
                          <div className="flex flex-row space-x-2 !text-gray-900 dark:!text-gray-300">
                            <span className="my-auto text-[11px]">Delete</span>
                            <BsTrash size={16}/>
                          </div>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
            <LazyImage
              className={
                isFocused
                  ? `${defaultStyle} focused ${$isNodeSelection(selection) ? "draggable" : ""}`
                  : `${defaultStyle}`
              }
              src={src}
              altText={altText}
              imageRef={imageRef}
              width={width}
              height={height}
            />
        </div>
        {(showCaption && caption) && (
          <div className="image-caption-container rounded-b-lg">
            <LexicalNestedComposer 
              initialEditor={caption}
              initialNodes={[
                RootNode,
                TextNode,
                LineBreakNode,
                ParagraphNode,
                LinkNode,
                EmojiNode,
                HashtagNode,
                KeywordNode,
              ]}
            >
              <AutoFocusPlugin />
              <MentionsPlugin />
              <LinkPlugin />
              <EmojisPlugin />
              <HashtagPlugin />
              <KeywordsPlugin />
              {isCollabActive ? (
                <CollaborationPlugin
                  id={caption.getKey()}
                  providerFactory={createWebsocketProvider}
                  shouldBootstrap={true}
                />
              ) : ( <HistoryPlugin externalHistoryState={historyState} /> )}
              <RichTextPlugin
                contentEditable={<ContentEditable className="ImageNode__contentEditable !object-cover" />}
                placeholder={<Placeholder className="ImageNode__placeholder"> Enter a caption... </Placeholder>}
                ErrorBoundary={LexicalErrorBoundary}
              />
            </LexicalNestedComposer>
          </div>
        )}
        {(resizable && $isNodeSelection(selection)) && (isFocused && currentScreenSize.width > 640) && (
          <ImageResizer
            showCaption={showCaption}
            setShowCaption={setShowCaption}
            editor={editor}
            buttonRef={buttonRef}
            imageRef={imageRef}
            maxWidth={0}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            captionsEnabled={captionsEnabled}
          />
        )}
      </div>
    </Suspense>
  );
}