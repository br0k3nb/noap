import { useState, useEffect, useRef, forwardRef } from "react";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "../plugins/CustomCheckListPlugin";
import { ListPlugin } from '../plugins/CustomListPlugin';
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";

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

import useEvent from "../../../../../hooks/useEvent";
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

    const { noteSettings: { expanded, readMode, noteBackgroundColor } } = useNoteSettings();
    const { 
      userData: {
        settings: {
          noteTextExpanded,
          globalNoteBackgroundColor
        } 
      }
    } = useUserData();

    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
    const [currentScreenSize, setCurrentScreenSize] = useState<any>(defaultScreenSize);
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

    const { settings: { isRichText } } = useSettings();
    const customRef = useRef(null);

    let timer: ReturnType<typeof setTimeout> | null = null;  
    const editorContainer = document.getElementById("editor-parent-container") as HTMLElement;
    
    const triggerSaveOnKeyUp = (e: Event) => {
      //excluding function keys, alt & alt right, ctrl, arrows and other keys that shouldn't trigger the save function
      const excludedKeycodes = [0, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 44, 45, 91, 92, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145, 173, 174, 181, 182, 183];

      if(excludedKeycodes.every(v => v !== (e as KeyboardEvent).keyCode)) {
        if(timer) clearTimeout(timer);

        timer = setTimeout(() => {
          save(editor.getEditorState());
        }, 2500);
      }
    };
    
    useEvent(editorContainer, 'keyup', triggerSaveOnKeyUp);

    useEffect(() => {
      const updateViewPortWidth = () => {
        const isNextSmallWidthViewport = CAN_USE_DOM && matchMedia("(max-width: 1025px)").matches;
      
        if (isNextSmallWidthViewport !== isSmallWidthViewport) setIsSmallWidthViewport(isNextSmallWidthViewport);
        setTimeout(() => setCurrentScreenSize({ width: innerWidth, height: innerHeight }));
      };

      updateViewPortWidth();
      addEventListener("resize", updateViewPortWidth);
      setTimeout(() => setFloatingAnchorElem(ref?.current));

      return () => removeEventListener("resize", updateViewPortWidth);
    }, [isSmallWidthViewport, expanded]);

    useEffect(() => {
      if(readMode) editor.setEditable(false);
      else editor.setEditable(true);
    }, [readMode]);

    const editorHeight = currentScreenSize.width > 640 ? 
      readMode ? currentScreenSize.height - 55 : currentScreenSize.height - 100
      : currentScreenSize.height - 65;

    const tweentyPercentMarginOfScreen = currentScreenSize.width - ((currentScreenSize.width / 100) * 20);
    const noteTextCondition = tweentyPercentMarginOfScreen < 1001 ? tweentyPercentMarginOfScreen : 1000;

    //for some reason, typescript is throwing an error if this code is not set as any.
    //it's saying that the checkVisibility method does not exist in type HTMLElement, which is not true, since HTMLElement extends Element.
    const getNavbar = document.getElementById("pc-navbar") as any;
    
    const baseStyle = {
      marginTop: (currentScreenSize.width < 1030 && !readMode) ? 0 : !readMode ? 50 : 0,
      marginBottom: (currentScreenSize.width < 1030 && !readMode) ? 86 : !readMode ? 80 : 0,
      paddingRight: (globalNoteBackgroundColor && currentScreenSize.width > 640 ) ? 40 : 0,
      paddingLeft: (globalNoteBackgroundColor && currentScreenSize.width > 640 ) ? 40 : 0,
      minHeight: '1500px',
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
          {isRichText && (
            <>
              <RichTextPlugin
                contentEditable={
                  <div className="editor dark:!bg-[#0f1011] bg-[#ffffff]" ref={ref}>
                    <div
                      className={`!overflow-y-scroll overflow-x-hidden`}
                      id="editor-parent-container"
                      style={!expanded && getNavbar?.checkVisibility() ? {
                          width: currentScreenSize.width <= 1023 ? currentScreenSize.width : currentScreenSize.width  - 440,
                          height: editorHeight
                        } : {
                          width: currentScreenSize.width,
                          height: editorHeight
                        }
                      }  
                    >
                      <div                        
                        className="flex flex-col mx-auto py-10"
                        style={
                          !expanded && getNavbar?.checkVisibility() ? {
                            ...baseStyle,
                            width: noteTextExpanded && currentScreenSize.width > 1430 
                              ? (globalNoteBackgroundColor ? noteTextCondition + 40 : noteTextCondition) 
                              : currentScreenSize.width - 435
                          } : { 
                            ...baseStyle,
                            width: noteTextExpanded && currentScreenSize.width > 1000 
                              ? (globalNoteBackgroundColor ? noteTextCondition + 40 : noteTextCondition) 
                              : currentScreenSize.width
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
                            currentScreenSize={currentScreenSize.width}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                }
                
                placeholder={
                  !note.body.length ? <Placeholder customRef={customRef}>Enter some text</Placeholder> : null
                }
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
                  {currentScreenSize.width > 640 && <DraggableBlockPlugin anchorElem={floatingAnchorElem} />}
                  <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
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