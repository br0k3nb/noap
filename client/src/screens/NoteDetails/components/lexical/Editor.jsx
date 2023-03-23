import {
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

import { useLocation } from "react-router";

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
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";

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
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import PlaygroundEditorTheme from "./appThemes/PlaygroundEditorTheme";

import "./index.css";

export const Editor = forwardRef((props, ref) => {
  const [formIds, setFormIds] = useState([]);

  const [findMentions, setFindMentions] = useState([]);

  const [content, setContent] = useState("");

  const location = useLocation();

  let [editor] = useLexicalComposerContext();

  const { historyState } = useSharedHistoryContext();

  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
    },
  } = useSettings();
  const text = isRichText
    ? "Write something here..."
    : "Write something here...";

  const placeholder = <Placeholder>{text}</Placeholder>;

  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      generate(setHtml, callback) {
        editor.update(() => {
          const htmlDoc = $generateHtmlFromNodes(editor, null);
          setHtml(htmlDoc);
          if (callback) callback();
        });
      },

      refreshValues(updateTo) {
        setFormIds(updateTo);
        editor.update(() => {});
      },

      refreshContent(docContent) {
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(docContent, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);

          $getRoot().select();

          $insertNodes(nodes);
        });
      },
    };
  });

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
        <ListMaxIndentLevelPlugin/>
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
                <div className="editor h-[810px]" ref={onRef}>
                  <ContentEditable />
                  <TabFocusPlugin />
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <FloatingTextFormatToolbarPlugin />
            <CodeHighlightPlugin />
            <CodeActionMenuPlugin/>
            <ListPlugin />
            <CheckListPlugin />
            <ImagesPlugin captionsEnabled={true} />
            <HistoryPlugin externalHistoryState={historyState} />
            <LinkPlugin />
            <PollPlugin />
            <ClickableLinkPlugin />
            <HorizontalRulePlugin />
            <CollapsiblePlugin />
            <EquationsPlugin />
            <StickyPlugin />
          </>
        )}

        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin charset={isCharLimit ? "UTF-16" : "UTF-8"} />
        )}

        {isAutocomplete && <AutocompletePlugin />}
      </div>
    </>
  );
});
