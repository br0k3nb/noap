import { useState, useEffect, forwardRef, useContext } from "react";

import { AiFillSave } from "react-icons/ai";
import { MdDeleteForever, MdOutlineSettings, MdNewLabel } from "react-icons/md";
import { BsXLg } from 'react-icons/bs';

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, LexicalEditor } from "lexical";

import { useSettings } from "./context/SettingsContext";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
// import AutocompletePlugin from "./plugins/AutocompletePlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
// import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
// import ClickableLinkPlugin from "./plugins/ClickableLinkPlugin";
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
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
// import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
// import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
// import MentionsPlugin from "./plugins/MentionsPlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
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

import { UseFormRegister, FieldValues } from "react-hook-form";

import { ExpandedCtx } from "../../../../context/NoteExpandedCtx";
import { RefetchCtx } from "../../../../context/RefetchCtx";

import { toastAlert } from "../../../../components/Alert/Alert";
import ConfirmationModal from "../../../../components/ConfirmationModal";

// import LabelModal from "../../../Home/components/nav/components/LabelModal";

import api from "../../../../services/api";

import "./index.css";

type Props = {
  note: any;
  saveSpinner: boolean;
  register: UseFormRegister<FieldValues>;
  floatingAnchorElem: HTMLDivElement | null;
  save: (currentState: EditorState) => Promise<void>;
};

type TitleProps = {
  register: UseFormRegister<FieldValues>;
  disableToolbar: () => void;
  noteCtx: any;
};

type BottomBarProps = {
  save: (currentState: EditorState) => Promise<void>;
  editor: LexicalEditor;
  saveSpinner: boolean;
  note: any;
};

const Editor = forwardRef(
  ({ save, register, saveSpinner, floatingAnchorElem, note }: Props, ref) => {
    const [ editor ] = useLexicalComposerContext();
    const { historyState } = useSharedHistoryContext();

    const noteExpanded = useContext(ExpandedCtx);
    const [ titleFocused, setTitleFocused ] = useState(false);

    const {
      settings: { isRichText },
    } = useSettings();

    const placeholder = <Placeholder>Enter some text</Placeholder>;

    const [ isSmallWidthViewport, setIsSmallWidthViewport ] = useState<boolean>(false);

    useEffect(() => {
      const updateViewPortWidth = () => {
        const isNextSmallWidthViewport =
          CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

        if (isNextSmallWidthViewport !== isSmallWidthViewport)
          setIsSmallWidthViewport(isNextSmallWidthViewport);
      };

      window.addEventListener("resize", updateViewPortWidth);

      return () => {
        window.removeEventListener("resize", updateViewPortWidth);
      };
    }, [isSmallWidthViewport]);

    const disableToolbar = () => setTitleFocused(true);

    return (
      <div className="!h-screen !w-screen">
        {titleFocused && <ToolbarPlugin titleFocused={titleFocused} />}
        {!titleFocused && <ToolbarPlugin titleFocused={titleFocused} />}
        <div className="editor-container plain-text">
          <DragDropPaste />
          <AutoFocusPlugin />
          <ComponentPickerPlugin />
          <AutoEmbedPlugin />
          <HashtagPlugin />
          <EmojisPlugin />
          <EmojiPickerPlugin />
          <AutoLinkPlugin />
          {isRichText && (
            <>
              <RichTextPlugin
                contentEditable={
                  // @ts-ignore
                  <div className="editor" ref={ref}>
                    <div
                      className={`
                        !overflow-y-scroll
                        scrollbar-thin
                        scrollbar-track-transparent
                        scrollbar-thumb-gray-900
                      `}
                      style={{
                        height:
                          window.outerWidth > 640
                            ? window.innerHeight - 100
                            : window.innerHeight - 65,
                      }}
                    >
                      <div onClick={() => setTitleFocused(true)}>
                        <TitleInput
                          register={register}
                          noteCtx={noteExpanded}
                          disableToolbar={disableToolbar}
                        />
                      </div>
                      <div
                        onClick={() => setTitleFocused(false)}
                        className="xxs:mb-5 mb-0 xxl:!mb-5 3xl:!mb-32 flex flex-col"
                        style={
                          !noteExpanded?.expanded
                            ? { width: window.innerWidth - 430 }
                            : { width: window.innerWidth }
                        }
                      >
                        <div className="mb-20">
                          <ContentEditable />
                        </div>
                        <div className="xxs:mt-20">
                          <BottomBar 
                            note={note}
                            save={save}
                            editor={editor}
                            saveSpinner={saveSpinner}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                }
                placeholder={placeholder}
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
  }
);

export function TitleInput({ register, noteCtx, disableToolbar }: TitleProps) {
  return (
    <div
      className="text-3xl mt-10 px-6 flex flex-wrap xxs:text-2xl"
      style={
        !noteCtx?.expanded
          ? { width: window.innerWidth - 430 }
          : { width: window.innerWidth }
      }
    >
      <textarea
        id="note-title"
        onClick={() => disableToolbar()}
        rows={ window.innerWidth > 640 ? 1 : 2 }
        wrap="hard"
        spellCheck="false"
        className="!bg-gray-700 w-full px-1 placeholder-gray-400 focus:outline-none resize-none"
        placeholder=" Enter a title"
        {...register("title")}
      />
    </div>
  );
}

export function BottomBar({ save, editor, saveSpinner, note } : BottomBarProps) {
  const noteExpanded = useContext(ExpandedCtx);
  const refetch = useContext(RefetchCtx);

  const [ open, setOpen ] = useState(false);
  // const [ openLabelModal, setOpenLabelModal ] = useState(false);

  const token = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const deleteLabel = async (labelId: string) => {
    try {
      const deleteLabel = await api.delete(`https://noap-typescript-api.vercel.app/note/delete/label/${labelId}/${note._id}/${token.token}`);

      refetch?.fetchNotes();
      toastAlert({
        icon: "success",
        title: `${deleteLabel.data.message}`,
        timer: 2000,
      });
    } catch (err: any) {
      console.log(err);
      toastAlert({
        icon: "error",
        title: `${err.response.data.message}`,
        timer: 2000,
      });
    }
  }

  const deleteAllLabels = async () => {
    try {
      const deleteLabels = await api.delete(`https://noap-typescript-api.vercel.app/note/delete-all/label/${token.token}/${note._id}`);
      
      refetch?.fetchNotes();
      setOpen(false);
      toastAlert({
        icon: "success",
        title: `${deleteLabels.data.message}`,
        timer: 2000,
      });
    } catch (err: any) {
      console.log(err);
      toastAlert({
        icon: "error",
        title: `${err.response.data.message}`,
        timer: 2000,
      });
    }
  }

  return (
    <div className="h-12 bg-gray-800 w-full fixed bottom-0 !z-50 border border-transparent border-t-gray-500">
      <div className="px-2 py-[0.50rem]">
        <div className="flex space-x-2">
          <div className="!mr-2">
            <div className="dropdown dropdown-top">
              <label 
                tabIndex={0}
              >
                <div className='tooltip tooltip-right' data-tip="Label actions">
                  <MdOutlineSettings size={30} className="px-1 rotate-180 bg-gray-600 rounded-full mt-[1px] cursor-pointer hover:bg-gray-700 transition-all duration-300 ease-in-out"/>
                </div>
              </label>
              <ul 
                tabIndex={0} 
                className="dropdown-content menu shadow rounded-box w-60 !bg-gray-900 !z-50"
              >
                <li className="">
                  <button
                    className="hover:bg-transparent text-xs uppercase tracking-widest py-4 active:bg-gray-500 hover:text-red-600 transition-all duration-500 ease-in-out disabled:cursor-not-allowed disabled:!bg-gray-900"
                    disabled={(!note?.labels || note?.labels.length === 0) && true}
                    onClick={() => setOpen(true)}
                  >
                    <div className="flex flex-row space-x-2">
                      <p className="py-1 text-xs uppercase tracking-widest">
                        Detach all labels
                      </p>
                      <MdDeleteForever size={22} className="mt-[1px]"/>
                    </div>
                  </button>
                </li>
                {/* <li>
                  <button
                    className="text-xs uppercase tracking-widest py-4 active:bg-gray-500"
                    onClick={() => setOpenLabelModal(true)}
                  >
                  <div className="flex flex-row space-x-2 ">
                      <p className="py-1 text-xs uppercase tracking-widest">
                        Add new label 
                      </p>
                      <MdNewLabel size={22} className="mt-[1px] rotate-180"/>
                    </div>
                  </button>
                </li> */}
              </ul>
            </div>
          </div>  
          <div className="h-5 w-[1px] border border-gray-600 mt-[0.35rem] !mr-2"/>
          <div 
            className="overflow-x-scroll overflow-y-hidden flex space-x-2 pt-[1.5px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500"
            style={
              !noteExpanded?.expanded
                ? { width: window.innerWidth <= 1280 ? window.innerWidth - 650 : window.innerWidth - 710} 
                : {
                  width: window.innerWidth > 640 && window.innerWidth <= 1280 ? window.innerWidth - 150 
                  : window.innerWidth <= 640 ? window.innerWidth - 150 : window.innerWidth - 280
                }
            }
          >
            {note?.labels && note?.labels.length > 0 ? (
              <>
                {note.labels.map((val: any, idx: number) => {
                  return (
                      <div className="max-w-lg mt-[1px]" key={idx}>
                        {val.type === "default" ? (
                          <div 
                            className="w-max rounded-full text-center px-2 py-[3px]"
                            style={{
                              backgroundColor: val.color,
                              borderColor: val.color,
                              color: val.fontColor
                            }}
                          >
                            <div className="flex space-x-1">
                              <p className="pt-[2px] !text-[11px] uppercase tracking-widest">
                                {val.name.slice(0, 13)}
                              </p>
                              <div className='tooltip tooltip-right' data-tip="Detach">
                                <BsXLg 
                                  size={20} 
                                  className="py-1 cursor-pointer hover:!bg-gray-900 rounded-full transition-all duration-500 ease-in-out"
                                  onClick={() => deleteLabel(val._id)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-max rounded-full text-center px-2 py-[2.5px] border"
                            style={{
                              backgroundColor: 'transparent !important',
                              borderColor: val.color,
                              color: val.color,
                            }}
                          >
                            <div className="flex space-x-1">
                              <p className="pt-[2px] !text-[11px] uppercase tracking-widest">
                                {val.name.slice(0, 13)}
                              </p>
                              <div className='tooltip tooltip-right' data-tip="Remove">
                                <BsXLg 
                                  size={20} 
                                  className="py-1 cursor-pointer hover:!bg-gray-900 rounded-full transition-all duration-500 ease-in-out"
                                  onClick={() => deleteLabel(val._id)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                })}
              </>
            ) : (
              <div className="text-xs uppercase tracking-widest">
                <p className="mt-[3px] px-2 py-[4px] bg-gray-900 rounded-full">
                    No labels attached!
                </p>
              </div>
            )}
          </div>
          <div className="h-5 w-[1px] border border-gray-600 mt-[0.35rem] mr-0 ml-0 xl:!ml-5"/>
            <div className="!ml-5">
              <button
                onClick={() => save(editor.getEditorState())}
                className="text-xs tracking-widest uppercase bg-gray-600 px-2 xxs:px-[6px] xl:px-5 rounded-2xl py-[5px] hover:bg-green-700 transition-all ease-in-out duration-500"
              >
                {saveSpinner ? (
                  <div className="flex space-x-2">
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-5 mx-1 text-white animate-spin xxs:my-[1.5px]  my-[1.5px]"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                    <p className="pt-[3px] text-xs">Loading...</p>
                  </div>
                ) : (
                  <div className="flex space-x-0 xl:space-x-2">
                    <p className="pt-[2px] hidden xl:inline">
                      Save note
                    </p>
                    <AiFillSave size={20} className=""/>
                  </div>
                )}
              </button>
            </div>
        </div>
      </div>
      {/* <LabelModal
        open={openLabelModal}
        setOpen={setOpenLabelModal}
        token={token}
      /> */}

      <ConfirmationModal
        open={open}
        setOpen={setOpen}
        deleteButtonAction={deleteAllLabels}
        mainText="Are you sure you want to remove all labels attached to this note?"
        subText="This action will only detach labels from this note!"
        subTextCustomClassName="xxs:mt-2 xxs:mb-7 mt-4 mb-6"
        modalWrapperClassName="!w-96"
      />
    </div> 
  )
}

export default Editor;