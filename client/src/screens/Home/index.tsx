import { useState, useRef, useReducer } from "react";
import { useQuery } from "react-query";
import { useForm, useFieldArray } from "react-hook-form";

import { toastAlert } from "../../components/Alert/Alert";

import Notes from "../Notes";
import Nav from "./Navbar";
import NoteDetails from "../NoteDetails";

import api from "../../services/api";

import useGetUrl from "../../hooks/useGetUrl";
import useNavbar from "../../hooks/useNavbar";
import useUserData from "../../hooks/useUserData";
import { useDebounce } from "../../hooks/useDebounce";
import useNoteSettings from "../../hooks/useNoteSettings";
import useSelectedNote from "../../hooks/useSelectedNote";
import useUpdateViewport from "../../hooks/useUpdateViewport";

import RefetchContext from "../../context/RefetchCtx";
import NavbarContext from "../../context/NavbarCtx";
import LabelsCtx from "../../context/LabelCtx";

import default_editor_state from "../../datasets/default_editor_state.json";

import { 
  pinnedNotesReducer,
  notesReducer,
  labelsReducer,
  label_default_value,
  note_default_value,
  pin_notes_default_value
} from "./reducers";

export default function Home(): JSX.Element {
  const [screenSize, setScreenSize] = useState<any>({ width: window.innerWidth });
  const [selectedNoteData, setSelectedNoteData] = useState<NoteData | null>(null);
  const [showLoaderOnNavbar, setShowLoaderOnNavbar] = useState(false);

  const [pinNotesState, dispatchPinNotes] = useReducer(pinnedNotesReducer, pin_notes_default_value);
  const [labelsState, dispatchLabels] = useReducer(labelsReducer, label_default_value);
  const [notesState, dispatchNotes] = useReducer(notesReducer, note_default_value);

  const delayedSearchLabel = useDebounce(labelsState.search, 500);
  const delayedSearch = useDebounce(notesState.search, 500);
  useUpdateViewport(setScreenSize, 500);
  
  const { navbar } = useNavbar();
  const { userData: { _id } } = useUserData();
  const { selectedNote } = useSelectedNote();
  const { noteSettings: { expanded: noteIsExpanded } } = useNoteSettings();

  const { control } = useForm<NoteMetadata>();
  const { control: labelsControl } = useForm<Labels>();
  const { control: pinnedNotesControl } = useForm<NoteMetadata>();

  const { fields, append, replace, remove } = useFieldArray({
    control,
    name: "noteMetadata"
  });

  const { fields: pinNotes, append: appendPinNotes, replace: replacePinNotes, remove: removePinNotes } = useFieldArray({
    control: pinnedNotesControl,
    name: "noteMetadata"
  });

  const { fields: labels, append: appendLabels, replace: replaceLabels, remove: removeLabels } = useFieldArray({
    control: labelsControl,
    name: "labels",
  });
  
  const currentPage = useGetUrl({
    options: {
      usePage: false,
      getPageInUrl: true
    }
  });

  //using these refs to prevent appending the same array two times
  const fetchedLabels = useRef(false);

  const fetchNotesMetadata = async () => { 
    dispatchNotes({ type: "PAGE", payload: currentPage });
    
    if(_id) {
      try {
        const { 
          data: { 
            notes: { docs, totalDocs, hasNextPage },
            pinnedNotes: { 
              docs: pinDocs,
              totalDocs: totalPinnedDocs,
              hasNextPage: pinHasNextPage
            }
          }
        } = await api.get(`/notes/${currentPage}/${_id}`, {
          params: { 
            pinnedNotesPage: pinNotesState.page,
            search: delayedSearch, 
            limit: 10 
          }
        });
  
        dispatchNotes({ 
          type: "TOTAL_DOCS_AND_NEXT_PAGE",
          payload: { totalDocs, hasNextPage }
        });

        dispatchPinNotes({
          type: "TOTAL_DOCS_AND_NEXT_PAGE",
          payload: { 
            totalDocs: totalPinnedDocs, 
            hasNextPage: pinHasNextPage 
          }
        });
    
        replacePinNotes(pinDocs);
        return replace(docs);
      } catch (err: any) {       
        toastAlert({ icon: "error", title: err.message, timer: 3000 });
        console.log(err);
      } 
    }
  };

  const fetchSelectedNoteData = async () => { 
    if(selectedNote && _id) {
      try {
        const { data: { note } } = await api.get(`/note/${selectedNote}`, {
          params: { author: _id }
        });

        setSelectedNoteData(note);
      } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: err.message, timer: 3000 });
        setSelectedNoteData(null);
      } 
    }
  };

  const fetchLabels = async () => {
    if(_id) {
      try {
        const { data: { docs, hasNextPage } } = await api.get(`/labels/${_id}`, { 
          params: { 
            search: delayedSearchLabel,
            page: labelsState.page,
            limit: 10
          }
        });

        dispatchLabels({ type: "NEXT_PAGE", payload: hasNextPage });

        if (!labels.length && !fetchedLabels.current) {
          fetchedLabels.current = true;
          appendLabels(docs);
        } 
        else replaceLabels(docs);
      } catch (err: any) {
          toastAlert({ icon: "error", title: err.message, timer: 3000 });
      }
    }  
  }

  const addNewNote = async () => {
    setShowLoaderOnNavbar(true);

    try {
      await api.post(`/add`, {
          name: "Unnamed note",
          body: "",
          labels: [],
          image: "",
          state: JSON.stringify(default_editor_state),
          settings: {
            shared: false,
            pinned: false
          },
          author: _id,
        }
      );

      fetchNotesMetadata();
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    } finally {
      setShowLoaderOnNavbar(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const deleteNote = await api.delete(`/delete/${noteId}`);
      toastAlert({ icon: "success", title: `${deleteNote.data.message}`, timer: 2000 });
    } catch (err: any) {
      toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  const { isFetching } = useQuery(
    ["verifyUser", delayedSearch, notesState.page, currentPage, pinNotesState.page, _id], 
    fetchNotesMetadata,
    { refetchInterval: 300000, refetchOnWindowFocus: false }
  );

  const { isFetching: noteDataIsFetching } = useQuery(["fetchNoteData", selectedNote, _id], fetchSelectedNoteData, {
    refetchOnWindowFocus: false
  });

  const { isFetching: labelIsFetching } = useQuery(["fetchLabels", delayedSearchLabel, labelsState.page, _id], fetchLabels, {
    refetchOnWindowFocus: false 
  });

  const notesProps = {
    isFetching,
    addNewNote,
    notesMetadata: fields,
    pinnedNotes: pinNotes,
    dispatchPinNotes,
    dispatchNotes,
    pinNotesState,
    notesState,
  };

  const navLabelCtxProps = {
    fetchLabels,
    removeLabels,
    labelIsFetching,
    dispatchLabels: dispatchLabels,
    pageLabel: labelsState.page,
    hasNextPageLabel: labelsState.hasNextPage,
    searchLabel: labelsState.search,
  };

  const isMobileDevice = screenSize.width <= 640 ? true : false;

  return (
    <div className="!h-screen">
      <NavbarContext>
        <LabelsCtx {...navLabelCtxProps}>
          <Nav
            labels={labels}
            addNewNote={addNewNote} 
            showSvgLoader={showLoaderOnNavbar}
          />
        </LabelsCtx>
        <div 
          className={`
            !overflow-hidden ${(!isMobileDevice && !noteIsExpanded) && (!navbar || navbar) ? 'ml-[60px]' : "ml-0"}
          `} 
        >
          <div className="flex flex-row h-screen">
            <Notes {...notesProps}/>
              <RefetchContext 
                fetchNotes={fetchNotesMetadata} 
                isFetching={isFetching}
              >
                <LabelsCtx  
                  pageLabel={labelsState.page}
                  searchLabel={labelsState.search}
                  dispatchLabels={dispatchLabels}
                  hasNextPageLabel={labelsState.hasNextPage}
                >
                  <NoteDetails 
                    notes={fields} 
                    remove={remove}
                    append={append}
                    labels={labels}
                    pinNotes={pinNotes}
                    deleteNote={deleteNote} 
                    appendPinNotes={appendPinNotes}
                    removePinNotes={removePinNotes}
                    labelIsFetching={labelIsFetching}
                    selectedNoteData={selectedNoteData}
                    setSelectedNoteData={setSelectedNoteData}
                    noteDataIsFetching={noteDataIsFetching}
                    dispatchPinNotes={dispatchPinNotes}
                    pinNotesState={pinNotesState}
                  />
                </LabelsCtx>
              </RefetchContext>
          </div>
        </div>
      </NavbarContext>
    </div>
  );
}