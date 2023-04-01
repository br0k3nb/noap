import { useState, useEffect, forwardRef } from "react";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, LexicalEditor } from "lexical";

import { useSettings } from "./context/SettingsContext";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import AutocompletePlugin from "./plugins/AutocompletePlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import ClickableLinkPlugin from "./plugins/ClickableLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import CodeActionMenuPlugin from "./plugins/CodeActionMenuPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import EmojisPlugin from "./plugins/EmojisPlugin";
import EquationsPlugin from "./plugins/EquationsPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import HorizontalRulePlugin from "./plugins/HorizontalRulePlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import PollPlugin from "./plugins/PollPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import FigmaPlugin from "./plugins/FigmaPlugin";
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import { CAN_USE_DOM } from "./shared/canUseDOM";
import TwitterPlugin from "./plugins/TwitterPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";

import { AiFillSave } from 'react-icons/ai';

import "./index.css";

type Save = {
  save: (currentState: EditorState) => Promise<void>
};

type CustomSaveComp = {
  save: (currentState: EditorState) => Promise<void>;
  editor: LexicalEditor;
};

const Editor = forwardRef(({save}: Save, ref) => {
  const [editor] = useLexicalComposerContext();
  const { historyState } = useSharedHistoryContext();
  
  const {
    settings: {
      isCharLimit,
      isCharLimitUtf8,
      isRichText
    },
  } = useSettings();
  
  const text = 'Enter some text...';

  const placeholder = <Placeholder>{text}</Placeholder>;

  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
  
  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };

    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <>
      <ToolbarPlugin />
      <div
        className={`editor-container ${
          !isRichText ? "plain-text" : ""
        }`}
      >
        <DragDropPaste />
        <ClearEditorPlugin />
        <AutoFocusPlugin />
        <ComponentPickerPlugin />
        <AutoEmbedPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <AutoLinkPlugin />
        <EmojisPlugin />
        <EmojiPickerPlugin />
        <ListPlugin />
        {isRichText && (
          <>
          {/* <span className="py-3 text-sm">Last edited in 00/00/00</span> */}
            <RichTextPlugin
              contentEditable={
                // @ts-ignore
                <div className="editor h-[852px] overflow-hidden" ref={ref}>
                  <ContentEditable />      
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <FloatingTextFormatToolbarPlugin />
            <FloatingSaveButton save={save} editor={editor}/>
            <CodeActionMenuPlugin />
            <CheckListPlugin />
            <ImagesPlugin captionsEnabled={true} />
            <HistoryPlugin externalHistoryState={historyState} />
            <LinkPlugin />
            <AutocompletePlugin/>
            <PollPlugin />
            <LinkPlugin />
            <PollPlugin />
            <MarkdownShortcutPlugin />
            <CodeHighlightPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TwitterPlugin />
            <YouTubePlugin />
            <FigmaPlugin />
            <ClickableLinkPlugin />
            <HorizontalRulePlugin />
            <EquationsPlugin />
            <ExcalidrawPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
          </>
        )}

        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? "UTF-16" : "UTF-8"}
            maxLength={5}
          />
        )}
        
      </div>
    </>
  );
});

export function FloatingSaveButton({save, editor}: CustomSaveComp) {
  return (
    <div className="relative">
      <div className="z-50 !w-30 fixed bottom-1 right-1">
        <div className="tooltip tooltip-top text-gray-300" data-tip="Save">
          <div className="pt-[5px]">
            <button 
              onClick={() => save(editor.getEditorState())}
              className="text-gray-200 bg-gray-800 py-3 px-3 rounded-full mx-1 mb-1 hover:bg-green-700 transition duration-300 ease-in-out"
            >
              <AiFillSave size={28}/>
            </button>
          </div>
        </div>
      </div> 
    </div>
  )
};

export default Editor;