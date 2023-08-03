import { useState, useEffect, useRef, forwardRef, useContext } from "react";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";

import { useSettings } from "../context/SettingsContext";
import { useSharedHistoryContext } from "../context/SharedHistoryContext";
// import AutocompletePlugin from "./plugins/AutocompletePlugin";
import AutoEmbedPlugin from "../plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "../plugins/AutoLinkPlugin";
// import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
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
// import KeywordsPlugin from "./plugins/KeywordsPlugin";
import LinkPlugin from "../plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
// import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
// import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
// import MentionsPlugin from "./plugins/MentionsPlugin";
import DraggableBlockPlugin from "../plugins/DraggableBlockPlugin";
import FloatingLinkEditorPlugin from "../plugins/FloatingLinkEditorPlugin";
// import PollPlugin from "./plugins/PollPlugin";
import TabFocusPlugin from "../plugins/TabFocusPlugin";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import FigmaPlugin from "../plugins/FigmaPlugin";
import ExcalidrawPlugin from "../plugins/ExcalidrawPlugin";
import ContentEditable from "../ui/ContentEditable";
import Placeholder from "../ui/Placeholder";
import { CAN_USE_DOM } from "../shared/canUseDOM";
import TwitterPlugin from "../plugins/TwitterPlugin";
import YouTubePlugin from "../plugins/YouTubePlugin";

import { NoteSettingsCtx } from "../../../../../context/NoteSettingsCtx";
import { UserDataCtx } from "../../../../../context/UserDataContext";

import BottomBar from "./BottomBar";

import "../index.css";

type Props = {
  note: any;
  saveSpinner: boolean;  
  save: (currentState: EditorState) => Promise<void>;
};

const defaultScreenSize = { width: window.innerWidth, height: window.innerHeight };

const Editor = forwardRef(({ save, saveSpinner, note }: Props, ref: any) => {
    const [editor] = useLexicalComposerContext();
    const { historyState } = useSharedHistoryContext();

    const { noteSettings: { expanded, readMode } } = useContext(NoteSettingsCtx) as any;
    const { userData: { settings: { noteTextExpanded } } } = useContext(UserDataCtx) as any;

    const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
    const [currentScreenSize, setCurrentScreenSize] = useState<any>(defaultScreenSize);
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

    const { settings: { isRichText } } = useSettings();
    const customRef = useRef(null);

    useEffect(() => {
      const updateViewPortWidth = () => {
        const isNextSmallWidthViewport = CAN_USE_DOM && matchMedia("(max-width: 1025px)").matches;
      
        if (isNextSmallWidthViewport !== isSmallWidthViewport) setIsSmallWidthViewport(isNextSmallWidthViewport);
        setTimeout(() => setCurrentScreenSize({ width: innerWidth, height: innerHeight }));
        console.log('riweuriwe');
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

    const editorHeight = currentScreenSize.width > 640 ? currentScreenSize.height - 100 : currentScreenSize.height - 65;

    const TweentyPercentMarginOfScreen = currentScreenSize.width - ((currentScreenSize.width / 100) * 20);
    const noteTextCondition = TweentyPercentMarginOfScreen < 1001 ? TweentyPercentMarginOfScreen : 1000;

    const getNavbar = document.getElementById("pc-navbar");

    return (
      <div className="!h-screen !w-screen">
        {!readMode && <ToolbarPlugin />}
        <div className="editor-container plain-text">
          <DragDropPaste />
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
                  <div className="editor" ref={ref}>
                    <div
                      className="!overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800 overflow-x-hidden"                     
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
                        className="mb-0 xxl:!mb-5 3xl:!mb-32 flex flex-col mx-auto"
                        style={
                          !expanded && getNavbar?.checkVisibility() ? { 
                            width: noteTextExpanded && currentScreenSize.width > 1430 ? noteTextCondition : currentScreenSize.width - 435
                          } : { 
                            width: noteTextExpanded && currentScreenSize.width > 1000 ? noteTextCondition : currentScreenSize.width
                          }
                        }
                      >
                        <div className="mb-20" ref={customRef}>
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
                placeholder={<Placeholder customRef={customRef}>Enter some text</Placeholder>}
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
              {/* <LexicalClickableLinkPlugin />
              <ClickableLinkPlugin /> */}
              <CodeHighlightPlugin />
              <TwitterPlugin />
              <YouTubePlugin />
              <FigmaPlugin />
              <HorizontalRulePlugin />
              <EquationsPlugin />
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
        </div>
      </div>
    );
  }
);

export default Editor;