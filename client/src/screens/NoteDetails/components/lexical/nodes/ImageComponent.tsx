import type {
  GridSelection,
  LexicalEditor,
  NodeKey,
  NodeSelection,
  RangeSelection,
} from "lexical";

import "./ImageNode.css";

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
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

import { Suspense, useCallback, useEffect, useRef, useState, useContext } from "react";
import { motion } from "framer-motion";

import { BsTrash, BsThreeDotsVertical, BsFillFileEarmarkArrowDownFill } from 'react-icons/bs';

import { createWebsocketProvider } from "../collaboration";
import { useSharedHistoryContext } from "../context/SharedHistoryContext";
import EmojisPlugin from "../plugins/EmojisPlugin";
import KeywordsPlugin from "../plugins/KeywordsPlugin";
import LinkPlugin from "../plugins/LinkPlugin";
import MentionsPlugin from "../plugins/MentionsPlugin";
import ContentEditable from "../ui/ContentEditable";
import ImageResizer from "../ui/ImageResizer";
import Placeholder from "../ui/Placeholder";
import { $isImageNode } from "./ImageNode";

import { ExpandedCtx } from "../../../../../context/NoteExpandedCtx";

const imageCache = new Set();

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
  maxWidth,
}: {
  altText: string;
  className: string | null;
  height: "inherit" | number;
  imageRef: { current: null | HTMLImageElement };
  maxWidth: number;
  src: string;
  width: "inherit" | number;
}): JSX.Element {
  useSuspenseImage(src);
  return (
    <img
      className={className || ''}
      src={src}
      alt={altText}
      ref={imageRef}
      style={{ height, maxWidth, width }}
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
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  caption: LexicalEditor;
  captionsEnabled: boolean;
  width: "inherit" | number;
  height: "inherit" | number;
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [ isSelected, setSelected, clearSelection ] = useLexicalNodeSelection(nodeKey);
  const { isCollabActive } = useCollaborationContext();
  const [ editor ] = useLexicalComposerContext();

  const [ isResizing, setIsResizing ] = useState<boolean>(false);
  const [ selection, setSelection ] = useState<RangeSelection | NodeSelection | GridSelection | null>(null);
  const [ hover, setHover ] = useState(false);
  const [ currentScreenSize, setCurrentScreenSize ] = useState(window.innerWidth);

  const onDelete = useCallback(
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

  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        } 

        else if ( buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [caption, isSelected, showCaption]
  );

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (activeEditorRef.current === caption || buttonRef.current === event.target) {
        $setSelection(null);

        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();

          if (parentRootElement !== null) parentRootElement.focus();
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected]
  );

  const onMouseClick = (payload: MouseEvent) => {
    const event = payload;
    
    if((event.target as any)?.id && (event.target as any)?.id === 'delete') {
      const ev = new KeyboardEvent('keypress', { key: 'Delete', keyCode: 46 });
      onDelete(ev);
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
  }

  useEffect(() => {
    let isMounted = true;
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
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onMouseClick, COMMAND_PRIORITY_LOW),
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
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW)
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    onDelete,
    onEnter,
    onEscape,
    setSelected
  ]);

  useEffect(() => {
    const updateScreenSize = () => setTimeout(() => setCurrentScreenSize(window.innerWidth), 500);
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) node.setShowCaption(true);
    });
  };  

  const onResizeEnd = (
    nextWidth: "inherit" | number,
    nextHeight: "inherit" | number
  ) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => setIsResizing(false), 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) node.setWidthAndHeight(nextWidth, nextHeight);
    });
  };

  const onResizeStart = () => setIsResizing(true);

  const { historyState } = useSharedHistoryContext();

  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = isSelected || isResizing;

  const noteExpanded = useContext(ExpandedCtx);

  const donwloadImage = (srcLink: string) => {
    const a = Object.assign(document.createElement("a"), { href: srcLink, style:"display:none", download: "image" });
    document.body.appendChild(a);

    a.click();
    a.remove();
  }

  const resizeBar = typeof width === "number" && width <= 257;
  const defaultStyle = "z-10 !rounded-lg !object-cover xxs:!max-h-96 xxs:!w-screen sm:!max-h-96 lg:!object-fill xl:!max-h-screen";

  return (
    <Suspense fallback={null}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div draggable={draggable} className="!object-cover !rounded-lg !relative">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3  }}
              className={`!absolute -top-0 -right-0 !w-8 !bg-gray-500 rounded-bl-lg rounded-tr-lg h-8 hidden ${hover && '!inline'}`}
            >
              <div className="flex flex-row space-x-2 px-2 pt-1 justify-between">  
                <div className="dropdown dropdown-left">
                  <label 
                    tabIndex={0}
                    className={`text-[11px] uppercase tracking-widest text-gray-300`}
                    style={resizeBar ? { fontSize: 10, paddingTop: 1 }: undefined}
                  >
                    <div className="rounded-full py-1 pl-[1px]">
                      <BsThreeDotsVertical size={resizeBar ? 13 : 15} style={resizeBar ? {paddingTop: 2} : undefined} / >
                    </div>
                  </label>
                  <ul tabIndex={0} className="dropdown-content menu shadow rounded-box w-36 !bg-gray-800">
                    {/* <li className="text-xs uppercase tracking-widest">
                      <a className="active:!bg-gray-trasparent hover:cursor-not-allowed bg-gray-700/70">Move up</a>
                    </li>
                    <li className="text-xs uppercase tracking-widest">
                      <a className="active:!bg-gray-trasparent hover:cursor-not-allowed bg-gray-700/70">Move down</a>
                    </li> */}
                    <li className="text-xs uppercase tracking-widest">
                      <a className="active:!bg-gray-600" onClick={() => donwloadImage(src)}>
                        <div className="flex flex-row space-x-2">
                          <span>Download</span>
                          <BsFillFileEarmarkArrowDownFill size={16}/>
                        </div>
                      </a>
                    </li>
                    <li className="text-xs uppercase tracking-widest">
                      <a
                        id="delete"
                        className="active:!bg-gray-600"
                        onClick={() => setSelected(true)}
                      >
                        <div className="flex flex-row space-x-2">
                          <span>Delete</span>
                          <BsTrash size={16}/>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
            <LazyImage
              className={
                isFocused
                  ? `${defaultStyle} focused ${$isNodeSelection(selection) ? "draggable" : ""}`
                  : `${defaultStyle} ${hover && "mb-[0.365rem]"}`
              }
              src={src}
              altText={altText}
              imageRef={imageRef}
              width={width}
              height={height}
              maxWidth={!noteExpanded?.expanded ? currentScreenSize - 495 : currentScreenSize - 58}
            />
        </div>
        {showCaption && (
          <div className="image-caption-container rounded-b-lg">
            <LexicalNestedComposer initialEditor={caption}>
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
                contentEditable={ <ContentEditable className="ImageNode__contentEditable !object-cover" />}
                placeholder={<Placeholder className="ImageNode__placeholder"> Enter a caption... </Placeholder>}
                ErrorBoundary={LexicalErrorBoundary}
              />
            </LexicalNestedComposer>
          </div>
        )}
        {(resizable && $isNodeSelection(selection)) && (isFocused && currentScreenSize > 640) && (
          <ImageResizer
            showCaption={showCaption}
            setShowCaption={setShowCaption}
            editor={editor}
            buttonRef={buttonRef}
            imageRef={imageRef}
            maxWidth={!noteExpanded?.expanded ? currentScreenSize - 495 : currentScreenSize - 58}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            captionsEnabled={captionsEnabled}
          />
        )}
      </div>
    </Suspense>
  );
}