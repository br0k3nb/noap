import { useState, useEffect, forwardRef, useContext } from "react";

// import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
// import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
// import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
// import { ListPlugin } from "@lexical/react/LexicalListPlugin";
// import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, LexicalEditor } from "lexical";

import { useSettings } from "./context/SettingsContext";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
// import AutocompletePlugin from "./plugins/AutocompletePlugin";
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
// import KeywordsPlugin from "./plugins/KeywordsPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
// import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
// import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
// import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
// import MentionsPlugin from "./plugins/MentionsPlugin";
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
// import PollPlugin from "./plugins/PollPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import FigmaPlugin from "./plugins/FigmaPlugin";
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import { CAN_USE_DOM } from "./shared/canUseDOM";
import TwitterPlugin from "./plugins/TwitterPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";

import { AiFillSave } from "react-icons/ai";
import { UseFormRegister, FieldValues } from "react-hook-form";
import { ExpandedContext } from "../..";

import "./index.css";

type Props = {
  save: (currentState: EditorState) => Promise<void>;
  register: UseFormRegister<FieldValues>;
  saveSpinner: boolean;
  floatingAnchorElem: HTMLDivElement | null;
};

type TitleProps = {
  register: UseFormRegister<FieldValues>;
  screenSize: number;
  noteCtx: any;
};

type CustomSaveComp = {
  save: (currentState: EditorState) => Promise<void>;
  editor: LexicalEditor;
  saveSpinner: boolean;
};

const Editor = forwardRef(({ save, register, saveSpinner, floatingAnchorElem }: Props, ref) => {
  const [editor] = useLexicalComposerContext();
  const { historyState } = useSharedHistoryContext();
  
  const noteExpanded = useContext(ExpandedContext);
  const [screenSize, setScreenSize] = useState(0);
  
  const {
    settings: { isRichText },
  } = useSettings();

  const placeholder = <Placeholder>Enter some text</Placeholder>;
  
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport = CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;
      
      if (isNextSmallWidthViewport !== isSmallWidthViewport) setIsSmallWidthViewport(isNextSmallWidthViewport);  
    };

    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);
  
  useEffect(() => {
    setScreenSize(window.outerWidth > 1030 && noteExpanded?.expanded ? window.outerWidth - 20 : 0);
  }, [noteExpanded?.expanded]);

  addEventListener(
    "resize", () => {
      setScreenSize(window.outerWidth > 1030 ? window.outerWidth - 60 - 380 : 0);
  });

  return (
    <div className="!h-screen !w-screen"> 
      <ToolbarPlugin/>
      <div className="editor-container plain-text">
        <DragDropPaste />
        {/* <ClearEditorPlugin /> */}
        {/* <AutoFocusPlugin /> */}
        <ComponentPickerPlugin />
        <AutoEmbedPlugin />
        <HashtagPlugin />
        <EmojisPlugin />
        <EmojiPickerPlugin />
        <AutoLinkPlugin />
        {/* <ListPlugin /> */}
        {/* <ListMaxIndentLevelPlugin maxDepth={7} /> */}
        {isRichText && (
          <>
            <RichTextPlugin
              contentEditable={
                // @ts-ignore
                <div className="editor" ref={ref}>
                 <div className={`
                      !overflow-x-hidden
                      !overflow-y-scroll
                      h-[900px]
                      scrollbar-thin
                      scrollbar-track-transparent
                      scrollbar-thumb-gray-900
                      `
                    }
                    style={{
                      height: window.outerWidth > 640 ? window.outerHeight - 240 : window.outerHeight - 200
                    }}
                  >
                    <TitleInput 
                      register={register} 
                      noteCtx={noteExpanded} 
                      screenSize={screenSize}                   
                    />
                    <div 
                      className="xxs:mb-5 mb-0"
                      style={screenSize !== 0 ? 
                        {width: screenSize} : 
                        {width: window.outerWidth > 1030 ? window.outerWidth - 455: '100%'}
                      }
                    >
                      <ContentEditable />
                    </div>
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <FloatingTextFormatToolbarPlugin />
            <FloatingSaveButton 
              save={save} 
              editor={editor} 
              saveSpinner={saveSpinner}
            />
            <CodeActionMenuPlugin />
            <CheckListPlugin />
            <ImagesPlugin captionsEnabled={true} />
            <HistoryPlugin externalHistoryState={historyState} />
            <LinkPlugin />
            {/* <AutocompletePlugin /> */}
            {/* <PollPlugin /> */} 
            {/* <MarkdownShortcutPlugin /> */}
            <CodeHighlightPlugin />
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
            
            {floatingAnchorElem && (
              <>
                {window.outerWidth > 640 && (
                  <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                )}
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export function TitleInput({register, noteCtx, screenSize}: TitleProps) {
  console.log(screenSize);
  return (
    <div 
      className="text-2xl mt-10 px-6 flex flex-wrap"
      style={noteCtx?.expanded ? { width: window.outerWidth - 22 } : { width: window.outerWidth - 455 }}
    >
      <textarea
        rows={2}
        wrap="hard"
        className="!bg-gray-700 w-full px-1 placeholder-gray-400 focus:outline-none resize-none"
        placeholder=" Enter a title"
        {...register("title")}
      />
    </div>
  );
}

export function FloatingSaveButton({ save, editor, saveSpinner }: CustomSaveComp) {
  return (
    <div className="relative">
      <div className="z-50 !w-30 fixed bottom-1 right-1">
        <div className={`tooltip tooltip-left text-gray-300 ${saveSpinner && "tooltip-open animate-pulse"}`}  data-tip={`${saveSpinner ? "Saving..." : "Save"}`}>
          <div className="pt-[5px]">
            <button
              onClick={() => save(editor.getEditorState())}
              className="text-gray-300 bg-gray-800 py-3 px-3 rounded-full mx-1 mb-1 hover:bg-green-700 transition duration-300 ease-in-out"
              >
                {saveSpinner ? (
                  <svg aria-hidden="true" role="status" className="inline w-5 h-6 mx-1 text-white animate-spin xxs:my-[1.5px]  my-[1.5px]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                  </svg>
                ): (
                  <AiFillSave size={28} />
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;