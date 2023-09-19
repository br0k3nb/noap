import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, useFieldArray } from "react-hook-form";

import { toastAlert } from "../../components/Alert/Alert";

import Notes from "../Notes";
import Nav from "./Navbar";
import NoteDetails from "../NoteDetails";

import api from "../../services/api";

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

export default function Home(): JSX.Element {
  const [screenSize, setScreenSize] = useState<any>({ width: window.innerWidth });
  const [selectedNoteData, setSelectedNoteData] = useState<NoteData | null>(null);
  const [pinnedNotesHasNextPage, setPinnedNotesHasNextPage] = useState(false);
  const [showLoaderOnNavbar, setShowLoaderOnNavbar] = useState(false);
  const [hasNextPageLabel, setHasNextPageLabel] = useState(false);
  const [pinnedNotesPage, setPinnedNotesPage] = useState(1);
  const [totalPinnedDocs, setTotalPinnedDocs] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchLabel, setSearchLabel] = useState('');
  const [pageLabel, setPageLabel] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const delayedSearchLabel = useDebounce(searchLabel, 500);
  const delayedSearch = useDebounce(search, 500);
  useUpdateViewport(setScreenSize, 500);
  
  const location = useLocation();
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
  
  const findPageInURL = new RegExp(`notes\/page\/([0-9]+)`);
  const getPageInURL = findPageInURL.exec(location.pathname);

  //using these refs to prevent appending the same array two times
  const fetchedLabels = useRef(false);

  const fetchNotesMetadata = async () => { 
    if(getPageInURL) setPage(Number(getPageInURL[1]));

    const pageUrl = getPageInURL ? getPageInURL[1] : 1;

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
        } = await api.get(`/notes/${pageUrl}/${_id}`, {
          params: { 
            pinnedNotesPage: pinnedNotesPage,
            search: delayedSearch, 
            limit: 10 
          }
        });
  
        setTotalDocs(totalDocs);
        setHasNextPage(hasNextPage);
        setTotalPinnedDocs(totalPinnedDocs);
        setPinnedNotesHasNextPage(pinHasNextPage);

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
            page: pageLabel,
            limit: 10
          }
        });

        setHasNextPageLabel(hasNextPage);

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

  const { isFetching } = useQuery(["verifyUser", delayedSearch, page, getPageInURL, pinnedNotesPage, _id], fetchNotesMetadata, {
    refetchInterval: 300000,
    refetchOnWindowFocus: false
  });

  const { isFetching: noteDataIsFetching } = useQuery(["fetchNoteData", selectedNote, _id], fetchSelectedNoteData, {
    refetchOnWindowFocus: false
  });

  const { isFetching: labelIsFetching } = useQuery(["fetchLabels", delayedSearchLabel, pageLabel, _id], fetchLabels, { 
    refetchOnWindowFocus: false 
  });

  const notesProps = {
    page,
    search,
    setPage,
    setSearch,
    totalDocs,
    isFetching,
    addNewNote,
    hasNextPage,
    notesMetadata: fields,
    totalPinnedDocs,
    pinnedNotes: pinNotes,
    pinnedNotesPage: pinnedNotesPage,
    setPinnedNotesPage: setPinnedNotesPage,
    pinnedNotesHasNextPage: pinnedNotesHasNextPage
  };

  const navLabelCtxProps = {
    pageLabel,
    searchLabel,
    fetchLabels,
    removeLabels,
    setPageLabel,
    labelIsFetching,
    setSearchLabel,
    hasNextPageLabel
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
                  pageLabel={pageLabel}
                  searchLabel={searchLabel}
                  setPageLabel={setPageLabel}
                  setSearchLabel={setSearchLabel}
                  hasNextPageLabel={hasNextPageLabel}
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
                    setPinnedNotesPage={setPinnedNotesPage}
                    noteDataIsFetching={noteDataIsFetching}
                  />
                </LabelsCtx>
              </RefetchContext>
          </div>
        </div>
      </NavbarContext>
    </div>
  );
}