import { useState, useEffect, useRef, forwardRef } from "react";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "../plugins/CustomCheckListPlugin";
import { ListPlugin } from '../plugins/CustomListPlugin';
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, LexicalEditor } from "lexical";

import { useSharedHistoryContext } from "../context/SharedHistoryContext";
import AutoEmbedPlugin from "../plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "../plugins/AutoLinkPlugin";
import ClickableLinkPlugin from "../plugins/ClickableLinkPlugin";
import CodeHighlightPlugin from "../plugins/CodeHighlightPlugin";
import CodeActionMenuPlugin from "../plugins/CodeActionMenuPlugin";
import CollapsiblePlugin from "../plugins/CollapsiblePlugin";
import ComponentPickerPlugin from "../plugins/ComponentPickerPlugin";
import DragDropPaste from "../plugins/DragDropPastePlugin";
import EmojiPickerPlugin from "../plugins/EmojiPickerPlugin";
import EmojisPlugin from "../plugins/EmojisPlugin";
import EquationsPlugin from "../plugins/EquationsPlugin";
import FloatingTextFormatToolbarPlugin from "../plugins/FloatingTextFormatToolbarPlugin";
import HorizontalRulePlugin from "../plugins/HorizontalRulePlugin";
import ImagesPlugin from "../plugins/ImagesPlugin";
import LinkPlugin from "../plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
import DraggableBlockPlugin from "../plugins/DraggableBlockPlugin";
import FloatingLinkEditorPlugin from "../plugins/FloatingLinkEditorPlugin";
import TabFocusPlugin from "../plugins/TabFocusPlugin";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import FigmaPlugin from "../plugins/FigmaPlugin";
import ExcalidrawPlugin from "../plugins/ExcalidrawPlugin";
import ContentEditable from "../ui/ContentEditable";
import Placeholder from "../ui/Placeholder";
import { CAN_USE_DOM } from "../shared/canUseDOM";
import TwitterPlugin from "../plugins/TwitterPlugin";
import YouTubePlugin from "../plugins/YouTubePlugin";
import { LayoutPlugin } from '../plugins/LayoutPlugin/LayoutPlugin';

import { useSettings } from "../context/SettingsContext";
import SaveNoteContext from "../../../../../context/SaveNoteCtx";

import useUserData from "../../../../../hooks/useUserData";
import useNoteSettings from "../../../../../hooks/useNoteSettings";

import BottomBar from "./BottomBar";

import "../index.css";

type Props = {
  note: NoteData;
  saveSpinner: boolean;  
  save: (currentState: EditorState) => Promise<void>;
};

const defaultScreenSize = { width: innerWidth, height: innerHeight };

const Editor = forwardRef(({ save, saveSpinner, note }: Props, ref: any) => {
    const [editor] = useLexicalComposerContext();
    const { historyState } = useSharedHistoryContext();

    const { noteSettings: { expanded, readMode, noteBackgroundColor, showBottomBar } } = useNoteSettings();
    const { 
      userData: {
        settings: {
          noteTextExpanded,
          globalNoteBackgroundColor
        } 
      }
    } = useUserData();

    const [isLinkEditMode, setIsLinkEditMode] = useState(false);
    const [rootElWasTouched, setRootElWasTouched] = useState(false);
    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
    const [currentScreenSize, setCurrentScreenSize] = useState<any>(defaultScreenSize);
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

    const { settings: { isRichText } } = useSettings();
    const customRef = useRef(null);

    let timer: ReturnType<typeof setTimeout> | null = null;
    
    const { height: currentHeight, width: currentWidth } = currentScreenSize;
    const BOTTOM_BAR_HEIGHT = 54;
    const MEDIUM_SCREEN = currentWidth > 640;
    const BIG_SCREEN = currentWidth > 1030;
    const LARGE_SCREEN = currentWidth > 1430;

    const getRootEditorEl = document.getElementById("ContentEditable__root");
    
    useEffect(() => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      getRootEditorEl?.addEventListener('click', () => {
        if(timer) clearTimeout(timer);

        timer = setTimeout(() => setRootElWasTouched(true), 200);
      });
    }, [getRootEditorEl])

    const onEditorChange = (eS: EditorState, e: LexicalEditor, tags: Set<string>) => {
      if(tags && rootElWasTouched) {
        console.log(rootElWasTouched);
        if(timer) clearTimeout(timer);
  
        timer = setTimeout(() => save(editor.getEditorState()), 2500);
      }
    }

    useEffect(() => {
      let viewportTimeout: ReturnType<typeof setTimeout> | null = null;

      const updateViewPortWidth = () => {
        const isNextSmallWidthViewport = CAN_USE_DOM && matchMedia("(max-width: 1025px)").matches;
      
        if (isNextSmallWidthViewport !== isSmallWidthViewport) setIsSmallWidthViewport(isNextSmallWidthViewport);
        viewportTimeout = setTimeout(() => setCurrentScreenSize({ width: innerWidth, height: innerHeight }));
      };

      updateViewPortWidth();
      addEventListener("resize", updateViewPortWidth);
      const floatingAnchorElTimout = setTimeout(() => setFloatingAnchorElem(ref?.current));

      return () => (
        removeEventListener("resize", updateViewPortWidth),
        clearTimeout(floatingAnchorElTimout),
        clearTimeout(viewportTimeout as ReturnType<typeof setTimeout>)
      )
    }, [isSmallWidthViewport, expanded]);

    useEffect(() => {
      if(readMode) editor.setEditable(false);
      else editor.setEditable(true);
    }, [readMode]);

    const editorHeight = MEDIUM_SCREEN ? 
      readMode ? currentHeight : currentHeight - 100
      : (showBottomBar ? currentHeight - BOTTOM_BAR_HEIGHT : currentHeight - 5);

    const tweentyPercentMarginOfScreen = currentWidth - ((currentWidth / 100) * 20);
    const noteTextCondition = tweentyPercentMarginOfScreen <= 1000 ? tweentyPercentMarginOfScreen : 1000;

    //for some reason, typescript is throwing an error if this code is not set as any.
    //it's saying that the checkVisibility method does not exist in type HTMLElement, which is not true, since HTMLElement extends Element.
    const getNavbar = document.getElementById("pc-navbar") as any;
    
    const baseStyle = {
      marginTop: BIG_SCREEN ? 50 : 0,
      marginBottom: BIG_SCREEN ? 86 : 0,
      paddingRight: MEDIUM_SCREEN ? 40 : 0,
      paddingLeft: MEDIUM_SCREEN ? 40 : 0,
      backgroundColor: noteBackgroundColor ? noteBackgroundColor : globalNoteBackgroundColor ? globalNoteBackgroundColor : 'none',
    };

    return (
      <div className="editor-container plain-text dark:!bg-[#0f1011]">
        <SaveNoteContext saveNoteFn={save}>
          {!readMode && <ToolbarPlugin />}
          <EquationsPlugin />
          <DragDropPaste />
          <LayoutPlugin />
          <ComponentPickerPlugin />
          <AutoEmbedPlugin />
          <HashtagPlugin />
          <EmojisPlugin />
          <EmojiPickerPlugin />
          <AutoLinkPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin 
            onChange={onEditorChange}
            ignoreHistoryMergeTagChange={true}
            ignoreSelectionChange={true}
          />
          {isRichText && (
            <>
              <RichTextPlugin
                contentEditable={
                  <div className="editor dark:!bg-[#0f1011] bg-[#ffffff]" ref={ref}>
                    <div
                      className="!overflow-y-scroll overflow-x-hidden"
                      id="editor-parent-container"
                      style={
                        (!expanded && getNavbar?.checkVisibility()) ? {
                          width: !BIG_SCREEN ? currentWidth : currentWidth - 440,
                          height: editorHeight
                        } : {
                          width: currentWidth,
                          height: editorHeight
                        }
                      }  
                    >
                      <div                        
                        className="flex flex-col mx-auto py-10"
                        style={
                          (!expanded && getNavbar?.checkVisibility()) ? {
                            ...baseStyle,
                            minHeight: '750px',
                            width: (noteTextExpanded && LARGE_SCREEN) ? noteTextCondition : currentWidth - 435
                          } : { 
                            ...baseStyle,
                            minHeight: '750px',
                            width: (noteTextExpanded && BIG_SCREEN) ? noteTextCondition : currentWidth
                          }
                        }
                      >
                        <div ref={customRef}>
                          <ContentEditable />
                        </div>
                      </div>
                      {!readMode && (
                        <div className="xxs:mt-20">
                          <BottomBar 
                            note={note}
                            save={save}
                            editor={editor}
                            saveSpinner={saveSpinner}
                            currentScreenSize={currentWidth}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                }
                placeholder={!note.body.length ? <Placeholder customRef={customRef}>Enter some text</Placeholder> : null}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <FloatingTextFormatToolbarPlugin />
              <CodeActionMenuPlugin />
              <ListPlugin />
              <CheckListPlugin />
              <ListMaxIndentLevelPlugin maxDepth={7} />
              <ImagesPlugin captionsEnabled={true} />
              <HistoryPlugin externalHistoryState={historyState} />
              <LinkPlugin />
              <ClickableLinkPlugin />
              {/* <AutocompletePlugin /> */}
              {/* <PollPlugin /> */}
              {/* <MarkdownShortcutPlugin /> */}
              <CodeHighlightPlugin />
              <TwitterPlugin />
              <YouTubePlugin />
              <FigmaPlugin />
              <HorizontalRulePlugin />
              <ExcalidrawPlugin />
              <TabFocusPlugin />
              <TabIndentationPlugin />
              <CollapsiblePlugin />
              {floatingAnchorElem && (
                <>
                  {MEDIUM_SCREEN && <DraggableBlockPlugin anchorElem={floatingAnchorElem} />}
                  <FloatingLinkEditorPlugin 
                    anchorElem={floatingAnchorElem}
                    setIsLinkEditMode={setIsLinkEditMode}
                  />
                </>
              )}
            </>
          )}
        </SaveNoteContext>
      </div>
    );
  }
);

export default Editor;