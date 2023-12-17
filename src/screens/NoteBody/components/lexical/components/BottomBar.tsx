import { useState } from "react";
import { AiFillSave } from "react-icons/ai";
import { BsXLg } from 'react-icons/bs';
import { MdDeleteForever, MdOutlineSettings } from "react-icons/md";

import { LexicalEditor, EditorState } from "lexical";

import useRefetch from "../../../../../hooks/useRefetch";
import useNoteSettings from "../../../../../hooks/useNoteSettings";

import { toastAlert } from "../../../../../components/Alert";
import ConfirmationModal from "../../../../../components/ConfirmationModal";
import SvgLoader from "../../../../../components/SvgLoader";

import api from "../../../../../services/api";

type BottomBarProps = {
  save: (currentState: EditorState) => Promise<void>;
  currentScreenSize: number;
  editor: LexicalEditor;
  saveSpinner: boolean;
  note: NoteData;
};

export default function BottomBar({ save, editor, saveSpinner, note, currentScreenSize } : BottomBarProps) {
    const { noteSettings: { showBottomBar } } = useNoteSettings();
    const { fetchNotes, fetchSelectedNote } = useRefetch();
  
    const [open, setOpen] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [labelToDelete, setLabelToDelete] = useState("");
  
    const deleteLabel = async (labelId: string) => {
      setShowLoader(true);
      try {
        const { data: { message } } = await api.delete(`/note/delete/label/${labelId}/${note._id}`);
        toastAlert({ icon: "success", title: message, timer: 2000 });

        setShowLoader(false);
        setLabelToDelete("");

        if(fetchSelectedNote) fetchSelectedNote();
        fetchNotes();
      } catch (err: any) {
        toastAlert({ icon: "error", title: err.message, timer: 2000 });
        setLabelToDelete("");
        setShowLoader(false);
      }
    }
  
    const deleteAllLabels = async () => {
      try {
        const { data: { message } } = await api.delete(`/note/delete-all/label/${note._id}`);
        toastAlert({ icon: "success", title: message, timer: 2000 });
        setOpen(false);

        if(fetchSelectedNote) fetchSelectedNote();
        fetchNotes();
      } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: err.message, timer: 2000 });
      }
    }

    const rootEditorDiv = document.getElementById("editor-parent-container");
    const editorWidth = rootEditorDiv ? rootEditorDiv.clientWidth : 0;

    return (
      <div 
        className={`
          h-12 bg-[#ffffff] dark:!bg-[#0f1011] w-full fixed bottom-0 !z-50 border border-transparent border-t-stone-300 dark:border-t-[#404040]
          ${!showBottomBar && "hidden"}
        `}
      >
        <div className="px-2 py-[0.50rem]">
          <div className="flex space-x-2">
            <div className="!mr-2">
              <div className="dropdown dropdown-top">
                <label tabIndex={0}>
                  <div className='tooltip tooltip-right tooltip-right-color-controller' data-tip="Label actions">
                    <MdOutlineSettings size={30} className="px-1 rotate-180 bg-[#d9dbde] hover:bg-[#c9c9c9] dark:!bg-[#202020] rounded-full mt-[1px] cursor-pointer transition-all duration-300 ease-in-out"/>
                  </div>
                </label>
                <ul 
                  tabIndex={0}
                  className="!pr-1 rounded-box !z-50 dropdown-content menu shadow bg-[#f8f8f8] dark:bg-[#1c1d1e] border border-gray-500"
                >
                  <div className="pr-2 !w-[220px] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-500">
                    <li>
                      <button
                        className="active:!bg-[#c1c1c1] hover:!bg-[#e2e2e2] dark:hover:!bg-[#323232] dark:active:!bg-[#404040] disabled:cursor-not-allowed disabled:!opacity-40 disabled:bg-inherit"
                        disabled={(!note?.labels || note?.labels.length === 0) && true}
                        onClick={() => setOpen(true)}
                      >
                        <div className="flex flex-row space-x-2 text-gray-900 dark:text-gray-300">
                          <p className="py-1 text-xs uppercase tracking-widest">
                            Detach all labels
                          </p>
                          <MdDeleteForever size={22} className="mt-[1px]"/>
                        </div>
                      </button>
                    </li>
                  </div>
                </ul>
              </div>
            </div>  
            <div className="h-5 w-[1px] border border-gray-600 dark:border-[#404040] mt-[0.35rem] !mr-2"/>
            <div 
              className="overflow-x-scroll overflow-y-hidden flex space-x-2 pt-[1.5px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500"
              style={{
                width: currentScreenSize < 1280 ? editorWidth - 150 : editorWidth - 55
              }}
            >
              {note.labels.length > 0 && (
                <>
                  {note.labels.map((val: any, idx: number) => {
                    const { color, fontColor, name, _id, type } = val;
                    
                    return (
                        <div className="max-w-lg mt-[1px]" key={idx}>
                          {type === "default" ? (
                            <div 
                              className="w-max rounded-full text-center px-2 py-[3px]"
                              style={{ backgroundColor: color, borderColor: color, color: fontColor }}
                            >
                              <div className="flex space-x-1">
                                <p className="pt-[2px] !text-[11px] uppercase tracking-widest">
                                  {name.length > 30 ? name.slice(0, 30) + '...' : name.slice(0, 30)}
                                </p>
                                <div 
                                  className={`
                                    ${(showLoader && labelToDelete === _id) ? 
                                      "tooltip tooltip-open tooltip-right tooltip-right-color-controller" 
                                      : "tooltip tooltip-right tooltip-right-color-controller"
                                    }
                                  `} 
                                  data-tip={`${(showLoader && labelToDelete === _id) ? "Detaching..." : "Detach"}`}
                                >
                                  <BsXLg 
                                    size={20} 
                                    onClick={() => {
                                      deleteLabel(_id);
                                      setLabelToDelete(_id);
                                    }}
                                    className="py-1 cursor-pointer hover:!bg-gray-900 rounded-full transition-all duration-500 ease-in-out"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="flex space-x-1 w-max rounded-full text-center px-2 py-[2.5px] border"
                              style={{ backgroundColor: 'transparent !important', borderColor: color, color }}
                            >
                              <p className="pt-[2px] !text-[11px] uppercase tracking-widest">
                                {name.length > 30 ? name.slice(0, 30) + '...' : name.slice(0, 30)}
                              </p>
                              <div className='tooltip tooltip-right' data-tip="Detach">
                                <BsXLg 
                                  size={20} 
                                  onClick={() => deleteLabel(_id)}
                                  className="py-1 cursor-pointer hover:!bg-gray-900 rounded-full transition-all duration-500 ease-in-out"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                  })}
                </>
              )}
            </div>
              {/* <div className="h-5 w-[1px] border border-gray-600 dark:border-[#404040] mt-[0.35rem] mr-0 ml-0 xl:!ml-5"/>
              <button
                onClick={() => save(editor.getEditorState())}
                className="!ml-5 text-xs h-[33px] tracking-widest uppercase bg-[#d9dbde] dark:!bg-[#202020] px-2 xxs:px-[6px] xl:px-5 rounded-2xl hover:bg-green-700 hover:text-gray-200 transition-all ease-in-out duration-500"
              >
                {saveSpinner ? ( 
                  <SvgLoader 
                    options={{ 
                      showLoadingText: true, 
                      LoadingTextClassName: "!text-[12px]", 
                      wrapperClassName: "xxs:px-2"
                    }} 
                  /> 
                ) : (
                  <div className="flex space-x-0 xl:space-x-2">
                    <p className="mt-[2px] hidden xl:inline">Save note</p>
                    <AiFillSave size={20} />
                  </div>
                )}
              </button> */}
          </div>
        </div>
        <ConfirmationModal
          open={open}
          setOpen={setOpen}
          actionButtonFn={deleteAllLabels}
          mainText="Are you sure you want to remove all labels attached to this note?"
          options={{  
            mainTextClassName: 'xxs:text-xs dark:text-gray-300 text-gray-900',
            modalWrapperClassName: "!w-96 xxs:!w-[22rem]",
            actionButtonText: "detach"
          }}
        />
    </div> 
  )
}