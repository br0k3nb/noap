import { useState, useEffect, forwardRef, useContext } from "react";

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

import { useSettings } from "./context/SettingsContext";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import TableCellNodes from "./nodes/TableCellNodes";
import ActionsPlugin from "./plugins/ActionsPlugin";
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
import StickyPlugin from "./plugins/StickyPlugin";
import FigmaPlugin from "./plugins/FigmaPlugin";
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import { CAN_USE_DOM } from "./shared/canUseDOM";
import TwitterPlugin from "./plugins/TwitterPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";

import { NoteContext } from "../../../Activities";
import "./index.css";

type props = {
  props: {
    teste: () => void;
  }
}

const Editor = forwardRef((props: props, ref) => {
  let [editor] = useLexicalComposerContext();

  const { historyState } = useSharedHistoryContext();
  const selectedNote = useContext(NoteContext);

  if(selectedNote?.selectedNote !== null) {
    const editorState = editor.parseEditorState(JSON.parse(selectedNote?.selectedNote.state as any));

    editor.setEditorState(editorState);
  }

  const {
    settings: {
      isCollab,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
    },
  } = useSettings();

  const text = 'Enter some text...';

  const placeholder = <Placeholder>{text}</Placeholder>;

  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  
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
        className={`editor-container ${showTreeView ? "tree-view" : ""} ${
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
        {isRichText && (
          <>
            <RichTextPlugin
              contentEditable={
                //@ts-ignore
                <div className="editor h-[805px]" ref={ref}>
                  <ContentEditable />
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <FloatingTextFormatToolbarPlugin />
            <CodeHighlightPlugin />
            <CodeActionMenuPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <ImagesPlugin captionsEnabled={true} />
            <HistoryPlugin externalHistoryState={historyState} />
            <LinkPlugin />
            <PollPlugin />
            <LinkPlugin />
            <PollPlugin />
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

        {/* {isAutocomplete && <AutocompletePlugin />} */}
      </div>
      <div className="border-t border-gray-600 h-[46px] overflow-y-hidden">
        <div className="flex flex-row justify-between px-3 pt-[1px]">
          <button 
            //@ts-ignore
            onClick={() => console.log(props.props(editor.getEditorState()))}
            className="text-gray-200 bg-green-600 w-28 h-[39.5px] px-2 rounded-lg my-1 hover:bg-green-700 transition duration-300 ease-in-out"
          >
            Save note
          </button>
          <span className="py-3 text-sm">Last edited in 00/00/00</span>
        </div>
      </div>
    </>
  );
});

export default Editor;