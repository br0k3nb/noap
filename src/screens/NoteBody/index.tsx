import TextEditor from "./components/lexical";
import Loader from "../../components/Loader";

import useNoteSettings from "../../hooks/useNoteSettings";
import useSelectedNote from "../../hooks/useSelectedNote";
import useGetUrl from "../../hooks/useGetUrl";

import "moment/locale/pt-br";

type Props = {
  selectedNoteData: NoteData | null;
  noteDataIsFetching: boolean;
};

export default function NoteBody({ selectedNoteData, noteDataIsFetching }: Props) {
  const { selectedNote } = useSelectedNote();
  const { noteSettings: { expanded } } = useNoteSettings();
  const getNoteIdInUrl = useGetUrl({ getNoteIdInUrl: true });

  return (
    <>
      {(!noteDataIsFetching && getNoteIdInUrl) && (selectedNote && selectedNoteData) ? (
        <div className="!overflow-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900">
          <TextEditor noteData={selectedNoteData} />
        </div>
      ) : (noteDataIsFetching && getNoteIdInUrl) && (
        <div 
          className="h-screen flex flex-col items-center absolute top-[40%] mx-auto"
          style={{ width: (innerWidth > 640 && !expanded) ? innerWidth - 440 : innerWidth }}
        >
          <Loader width={25} height={25} />
          <p className="mt-1 text-[22px] animate-pulse">Loading note...</p>
        </div>
      )}
    </>
  );
};