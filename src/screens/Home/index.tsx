import { useState, useRef, useReducer, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import { toastAlert } from "../../components/Alert";

import Notes from "../Notes";
import Nav from "./Navbar";
import NoteBody from "../NoteBody";
import NoteToolbar from "../NoteActionsToolbar";

import api from "../../services/api";

import useGetUrl from "../../hooks/useGetUrl";
import useNavbar from "../../hooks/useNavbar";
import useUserData from "../../hooks/useUserData";
import { useDebounce } from "../../hooks/useDebounce";
import useNoteSettings from "../../hooks/useNoteSettings";
import useSelectedNote from "../../hooks/useSelectedNote";
import useUpdateViewport from "../../hooks/useUpdateViewport";
import usePreventPageUpdateFromUrl from "../../hooks/usePreventPageUpdateFromUrl";

import SessionsContext from "../../context/SessionCtx";
import RefetchContext from "../../context/RefetchCtx";
import NavbarContext from "../../context/NavbarCtx";
import LabelsCtx from "../../context/LabelCtx";

import default_editor_state from "../../datasets/default_editor_state.json";

import { pinnedNotesReducer, pin_notes_default_value  } from "../../reducers/pinNoteReducer";
import { notesReducer, note_default_value} from "../../reducers/noteReducer";
import { labelsReducer, label_default_value } from "../../reducers/labelReducer";

export default function Home() {
  const [screenSize, setScreenSize] = useState<any>({ width: window.innerWidth });
  const [selectedNoteData, setSelectedNoteData] = useState<NoteData | null>(null);
  const [showLoaderOnNavbar, setShowLoaderOnNavbar] = useState(false);
  
  const [pinNotesState, dispatchPinNotes] = useReducer(pinnedNotesReducer, pin_notes_default_value);
  const [labelsState, dispatchLabels] = useReducer(labelsReducer, label_default_value);
  const [notesState, dispatchNotes] = useReducer(notesReducer, note_default_value);
  
  const delayedSearchLabel = useDebounce(labelsState.search, 500);
  const delayedSearch = useDebounce(notesState.search, 500);
  useUpdateViewport(setScreenSize, 500);
  
  const navigate = useNavigate();
  const { navbar } = useNavbar();
  const { userData: { _id } } = useUserData();
  const { selectedNote, setSelectedNote } = useSelectedNote();
  const { preventPageUpdateFromUrl } = usePreventPageUpdateFromUrl();
  const { noteSettings: { expanded: noteIsExpanded }, setNoteSettings } = useNoteSettings();
  const [currentPage, searchInUrl] = useGetUrl({ getPageInUrl: true, getSearchQueryInUrl: true });

  const { control } = useForm<NoteMetadata>();
  const { control: labelsControl } = useForm<Labels>();
  const { control: pinnedNotesControl } = useForm<NoteMetadata>();
  const { control: sesionsControl } = useForm<Sessions>();
  
  useEffect(() => {
    if(searchInUrl) {
      setTimeout(() => {
        dispatchNotes({ type: 'SEARCH', payload: searchInUrl });
      }, 1000);
    }
  }, [searchInUrl]);

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

  const { fields: sessions, replace: replaceSessions, remove: removeSessions } = useFieldArray({
    control: sesionsControl,
    name: "sessions",
  });

  //using these refs to prevent appending the same array two times
  const fetchedLabels = useRef(false);

  const fetchNotesMetadata = async () => {
    if(!preventPageUpdateFromUrl) {
      dispatchNotes({ type: "PAGE", payload: currentPage });
    }

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
        } = await api.get(`/notes/${notesState.page}/${_id}`, {
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
        setNoteSettings((prevNoteSettings) => {
          return {
              ...prevNoteSettings,
              expanded: false
          }
        });
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
  };
  
  const fetchSessions = async() => {
    try {
        if(_id) {
          const { data } = await api.get(`/get/sessions/${_id}`);

          replaceSessions(data);
        }
    } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: err.message, timer: 2000 });
    }
  };

  const addNewNote = async () => {
    setShowLoaderOnNavbar(true);

    const basePageNumber = String(notesState.totalDocs / 10)[0];
    const documentsPerPage = String(notesState.totalDocs / 10)[1];

    try {
      const { data: { noteId, pageLocation } } = await api.post(`/add`, {
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
          pageLocation: (basePageNumber && documentsPerPage !== "0") ? Number(basePageNumber) + 1 : basePageNumber
        }
      );

      await fetchNotesMetadata();

      setSelectedNote(noteId);
      setNoteSettings((prevSettings) => {
        return {
          ...prevSettings,
          expanded: window.outerWidth <= 1030 ? true : false
        }
      });
      
      navigate(`/notes/page/${pageLocation}/note/${noteId}`);
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
    ["verifyUser", delayedSearch, notesState.page, currentPage, pinNotesState.page, _id, preventPageUpdateFromUrl], 
    fetchNotesMetadata,
    { refetchInterval: 300000, refetchOnWindowFocus: false }
  );

  const { isFetching: noteDataIsFetching } = useQuery(["fetchNoteData", selectedNote, _id], fetchSelectedNoteData, {
    refetchOnWindowFocus: false
  });

  const { isFetching: labelIsFetching } = useQuery(["fetchLabels", delayedSearchLabel, labelsState.page, _id], fetchLabels, {
    refetchOnWindowFocus: false 
  });

  const { isFetching: sessionIsFetching } = useQuery(["fetch-sessions"], fetchSessions, { 
    refetchInterval: 300000,
    refetchOnWindowFocus: true,
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
    delayedSearch
  };

  const navLabelCtxProps = {
    fetchLabels,
    removeLabels,
    isFetching: labelIsFetching,
    dispatchLabels: dispatchLabels,
    pageLabel: labelsState.page,
    hasNextPageLabel: labelsState.hasNextPage,
    refetchNoteData: fetchSelectedNoteData,
    searchLabel: labelsState.search,
  };

  const isMobileDevice = screenSize.width <= 640 ? true : false;

  return (
    <div className="!h-screen">
      <NavbarContext>
        <LabelsCtx {...navLabelCtxProps}>
          <SessionsContext
            sessions={sessions}
            fetchSessions={fetchSessions}
            isFetching={sessionIsFetching}
            removeSession={removeSessions}
          >
            <Nav
              labels={labels}
              addNewNote={addNewNote} 
              showSvgLoader={showLoaderOnNavbar}
            />
          </SessionsContext>
        </LabelsCtx>
        <div 
          className={`
            !overflow-hidden ${(!isMobileDevice && !noteIsExpanded) && (!navbar || navbar) ? 'ml-[60px]' : "ml-0"}
          `} 
        >
          <div className="flex flex-row h-screen">
            <Notes {...notesProps}/>
            <RefetchContext 
              fetchSelectedNote={fetchSelectedNoteData}
              fetchNotes={fetchNotesMetadata} 
              isFetching={isFetching}
            >
              <LabelsCtx  
                pageLabel={labelsState.page}
                searchLabel={labelsState.search}
                dispatchLabels={dispatchLabels}
                hasNextPageLabel={labelsState.hasNextPage}
              >
                <div
                  className={`
                    !z-50 flex flex-col overflow-hidden w-screen h-screen bg-[#ffffff] dark:bg-[#0f1011] text-black dark:text-gray-300 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 
                    ${!noteIsExpanded && "hidden lg:flex"}
                  `}
                  id="note-body"
                >
                  <NoteToolbar
                    labels={labels}
                    labelIsFetching={labelIsFetching}
                    selectedNoteData={selectedNoteData}
                    noteDataIsFetching={noteDataIsFetching}
                    setSelectedNoteData={setSelectedNoteData}
                    notes={{ append, deleteNote, fetchNotesMetadata, notesMetadata: fields, remove }}
                    pinNotes={{ pinNotesMetadata: pinNotes, appendPinNotes, dispatchPinNotes, pinNotesState, removePinNotes }}
                  />
                  <NoteBody 
                    noteDataIsFetching={noteDataIsFetching}
                    selectedNoteData={selectedNoteData}
                  />          
                </div>
              </LabelsCtx>
            </RefetchContext>
          </div>
        </div>
      </NavbarContext>
    </div>
  );
}