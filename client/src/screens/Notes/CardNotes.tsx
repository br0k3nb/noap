import { useContext, SetStateAction, Dispatch } from "react";
import { FieldArrayWithId } from "react-hook-form";

import parse from "html-react-parser";

import moment from "moment";
import "moment/locale/pt-br";

import { NoteCtx } from "../../context/SelectedNoteCtx";
import ghost from '../../assets/ghost.png';
import Loader from "../../components/Loader";

type Props = {
  isFetching: boolean;
  addNewNote: () => Promise<void>;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  notes: FieldArrayWithId<Notes, "note", "id">[];
};

export default function CardNotes({ notes, addNewNote, isFetching, setExpanded }: Props) {
    const noteContext = useContext(NoteCtx);

    const hours = (date: string) => moment(date).format("LT");
    const days = (date: string) => moment(date).format("ll");

    const handleNoteClick = (_id: string) => {
        noteContext?.setSelectedNote(_id);
        setExpanded(window.outerWidth <= 1030 ? true : false);
    }

    return (
        <div className="bg-gray-800 text-gray-100 overflow-scroll h-screen scrollbar-thin scrollbar-thumb-gray-900">
            {isFetching ? (
                    <div className="flex flex-col items-center mt-14">
                        <Loader />
                        <p className="mt-2 text-xl animate-pulse">Loading notes...</p>
                    </div>
                ) : (
                    <div className="flex flex-row flex-wrap px-2 my-5 gap-y-6 gap-x-3 xxs:mb-20">
                        {notes.length > 0 ? (
                            <>
                                {notes.map((val, idx) => {
                                    const { image, labels, _id, body, createdAt, updatedAt, title } = val;
                                    const { color, type, fontColor, name } = labels?.length && labels[0] as any;
                                    const parsedImage = image !== "no image attached" ? parse(image as string): false;

                                    return (
                                        <a className={`mx-auto flex flex-wrap ${idx === notes.length - 1 && "mb-48"}`} onClick={() => handleNoteClick(_id)} key={_id}>
                                            <div className={`rounded-lg h-[18.4rem] w-[165px] xxs:w-[161px] border border-stone-900 bg-gray-700 pt-3 shadow-lg shadow-gray-900 hover:border transition duration-300 hover:border-gray-500 ${noteContext?.selectedNote === _id && "!border-gray-300"}`}>
                                                <p className="text-lg px-4 mb-3 truncate">{title}</p>
                                                <div className={`h-[196px] text-gray-300 flex flex-col px-4 ${parsedImage && "!h-[148px]"}`}>
                                                    <div className="!w-[135px] overflow-ellipsis overflow-hidden !mb-1">
                                                        {(labels && labels.length) && !parsedImage ? (body.length >= 135 ? body.slice(0,134).concat('...') : body) :
                                                        (labels && labels.length) && parsedImage ? body.slice(0, 73) + '...' : body}
                                                    </div>
                                                    {labels && labels.length > 0 && (
                                                        <div className="mt-1">
                                                            {type === "default" ? (
                                                                    <div className="flex space-x-1">
                                                                        <p 
                                                                            className="badge !text-[11px] badge-outline !py-1 uppercase text-xs tracking-wide"
                                                                            style={{ backgroundColor: color, borderColor: color, color: fontColor }}
                                                                        >
                                                                            {name.length > 16 ? name.slice(0, 11) + '...' : name}
                                                                        </p>
                                                                        {labels.length > 1 && (
                                                                        <div className="rounded-full w-[22px] h-[21px] bg-gray-900 text-gray-300">
                                                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">{'+ ' + (labels.length - 1)}</p>
                                                                        </div>
                                                                        )}
                                                                    </div> 
                                                                ) : (
                                                                    <div className="flex space-x-1">
                                                                        <p 
                                                                            className="badge badge-outline !py-1 uppercase !text-[11px] tracking-wide"
                                                                            style={{ backgroundColor: 'transparent !important', borderColor: color, color }}
                                                                        >
                                                                            {name.length > 14 ? name.slice(0, 14) + '...' : name}
                                                                        </p>
                                                                        {labels.length > 1 && (
                                                                        <div className="rounded-full w-[22px] h-[21px] bg-gray-900 text-gray-300">
                                                                            <p className="text-[9px] ml-[4.5px] mt-[4px]">{'+ ' + (labels.length - 1)}</p>
                                                                        </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs tracking-tighter mt-2 px-4 pb-[0.04rem]">
                                                    {!updatedAt ? days(createdAt) + " at " + hours(createdAt) : days(updatedAt) + " at " + hours(updatedAt)}
                                                </p>
                                                {parsedImage && <div className="h-[56px] mt-3 w-[165px] xxs:w-[161px] rounded-b-lg">{parsedImage}</div>}
                                                </div>
                                            </a>
                                        );
                                    })}
                            </>
                            ) : (
                                <div className="flex flex-col space-y-3 justify-center items-center mt-6 mx-auto">
                                    <img src={ghost} className="w-56 opacity-30 md:w-80 lg:w-56"/>
                                    <p className="!text-gray-400 text-[13px] uppercase tracking-wide">Ouhh, it's quite empty here...</p>                
                                    <button 
                                        className="!mt-4 text-gray-200 text-xs font-light tracking-widest uppercase px-3 mr-5 h-10 rounded-full hover:!bg-stone-900 border border-gray-500 transition-all duration-500 ease-in-out w-full mx-auto"
                                        onClick={() => addNewNote()}
                                    > 
                                        add a new note
                                    </button>
                                </div>  
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}