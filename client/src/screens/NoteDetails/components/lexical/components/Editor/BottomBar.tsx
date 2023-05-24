import { useState, useContext } from "react";
import { AiFillSave } from "react-icons/ai";
import { BsXLg } from 'react-icons/bs';
import { MdDeleteForever, MdOutlineSettings, MdNewLabel } from "react-icons/md";

import { LexicalEditor, EditorState } from "lexical";

import { RefetchCtx } from "../../../../../../context/RefetchCtx";
import { ExpandedCtx } from "../../../../../../context/NoteExpandedCtx";
import { ToggleBottomBarCtx } from "../../../../../../context/ToggleBottomBar";

import { toastAlert } from "../../../../../../components/Alert/Alert";
import ConfirmationModal from "../../../../../../components/ConfirmationModal";
import SvgLoader from "../../../../../../components/SvgLoader";

import api from "../../../../../../services/api";

type BottomBarProps = {
    save: (currentState: EditorState) => Promise<void>;
    currentScreenSize: number;
    editor: LexicalEditor;
    saveSpinner: boolean;
    note: any;
};

export default function BottomBar({ save, editor, saveSpinner, note, currentScreenSize } : BottomBarProps) {
  const toggleBottomBar = useContext(ToggleBottomBarCtx);
  const noteExpanded = useContext(ExpandedCtx);
  const refetch = useContext(RefetchCtx);
  
    const [ open, setOpen ] = useState(false);
  
    const token = JSON.parse(window.localStorage.getItem("user_token") || "");
  
    const deleteLabel = async (labelId: string) => {
      try {
        const deleteLabel = await api.delete(`/note/delete/label/${labelId}/${note._id}/${token.token}`);
        toastAlert({ icon: "success", title: `${deleteLabel.data.message}`, timer: 2000 });
        refetch?.fetchNotes();
      } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: `${err.response.data.message}`, timer: 2000 });
      }
    }
  
    const deleteAllLabels = async () => {
      try {
        const deleteLabels = await api.delete(`/note/delete-all/label/${token.token}/${note._id}`);
        toastAlert({ icon: "success", title: `${deleteLabels.data.message}`, timer: 2000 });
        refetch?.fetchNotes();
        setOpen(false);
      } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: `${err.response.data.message}`, timer: 2000 });
      }
    }
  
    return (
      <div className={`h-12 bg-gray-800 w-full fixed bottom-0 !z-50 border border-transparent border-t-gray-500 ${!toggleBottomBar?.showBottomBar && "hidden"}`}>
        <div className="px-2 py-[0.50rem]">
          <div className="flex space-x-2">
            <div className="!mr-2">
              <div className="dropdown dropdown-top">
                <label tabIndex={0}>
                  <div className='tooltip tooltip-right' data-tip="Label actions">
                    <MdOutlineSettings size={30} className="px-1 rotate-180 bg-gray-600 rounded-full mt-[1px] cursor-pointer hover:bg-gray-700 transition-all duration-300 ease-in-out"/>
                  </div>
                </label>
                <ul tabIndex={0} className="dropdown-content menu shadow rounded-box w-60 !bg-gray-900 !z-50">
                  <li>
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
                  ? { width: currentScreenSize <= 1280 ? currentScreenSize - 650 : currentScreenSize - 710 } 
                  : { width: currentScreenSize > 640 && currentScreenSize <= 1280 ? currentScreenSize - 150 
                  : currentScreenSize <= 640 ? currentScreenSize - 150 : currentScreenSize - 280 }
              }
            >
              {note?.labels && note?.labels.length > 0 ? (
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
                                <div className='tooltip tooltip-right' data-tip="Detach">
                                  <BsXLg 
                                    size={20} 
                                    onClick={() => deleteLabel(_id)}
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
              ) : ( 
                <p className="text-xs uppercase tracking-widest mt-[2px] px-2 pt-1 h-[25px] bg-gray-900 rounded-full">No labels attached!</p> 
              )}
            </div>
              <div className="h-5 w-[1px] border border-gray-600 mt-[0.35rem] mr-0 ml-0 xl:!ml-5"/>
              <button
                onClick={() => save(editor.getEditorState())}
                className="!ml-5 text-xs h-[33px] tracking-widest uppercase bg-gray-600 px-2 xxs:px-[6px] xl:px-5 rounded-2xl hover:bg-green-700 transition-all ease-in-out duration-500"
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
              </button>
          </div>
        </div>
        <ConfirmationModal
          open={open}
          setOpen={setOpen}
          deleteButtonAction={deleteAllLabels}
          mainText="Are you sure you want to remove all labels attached to this note?"
          options={{
            subText: "This action will only detach labels from this note!",
            mainTextCustomClassName: 'xxs:text-xs' ,
            subTextCustomClassName: "xxs:mt-2 xxs:mb-7 mt-4 mb-6 px-6",
            modalWrapperClassName: "!w-96 xxs:!w-[22rem]"
          }}
        />
    </div> 
  )
}