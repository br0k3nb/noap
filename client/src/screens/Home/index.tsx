import { useState, useRef, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, useFieldArray } from "react-hook-form";

import { toastAlert } from "../../components/Alert/Alert";

import Notes from "../Notes";
import Nav from "./Navbar";
import NoteDetails from "../NoteDetails";

import api from "../../services/api";

import { useDebounce } from "../../hooks/useDebounce";
import useUpdateViewport from "../../hooks/useUpdateViewport";

import SelectedNoteContext from "../../context/SelectedNoteCtx";
import { UserDataCtx } from "../../context/UserDataContext";
import RefetchContext from "../../context/RefetchCtx";
import NavbarContext from "../../context/NavbarCtx";
import LabelsCtx from "../../context/LabelCtx";

import default_editor_state from "../../datasets/default_editor_state.json";

export default function Home(): JSX.Element {
  const { userData: { _id } } = useContext(UserDataCtx) as any;

  const [screenSize, setScreenSize] = useState<any>({ width: window.innerWidth });
  const [selectedNoteData, setSelectedNoteData] = useState<NoteData | null>(null);
  const [pinnedNotesHasNextPage, setPinnedNotesHasNextPage] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [showLoaderOnNavbar, setShowLoaderOnNavbar] = useState(false);
  const [hasNextPageLabel, setHasNextPageLabel] = useState(false);
  const [noteIsExpanded, setNoteIsExpanded] = useState(false);    
  const [pinnedNotesPage, setPinnedNotesPage] = useState(1);
  const [totalPinnedDocs, setTotalPinnedDocs] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchLabel, setSearchLabel] = useState('');
  const [pageLabel, setPageLabel] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [navbar, setNavbar] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const delayedSearchLabel = useDebounce(searchLabel, 500);
  const delayedSearch = useDebounce(search, 500);
  useUpdateViewport(setScreenSize, 500);

  const location = useLocation();

  const { control } = useForm<NoteMetadata>();
  const { control: labelsControl } = useForm<Labels>();
  const { control: pinnedNotesControl } = useForm<NoteMetadata>();

  const { fields, append, replace, remove } = useFieldArray({ control, name: "noteMetadata" });

  const { fields: pinNotes, append: appendPinNotes, replace: replacePinNotes, remove: removePinNotes } = useFieldArray({ 
    control: pinnedNotesControl, 
    name: "noteMetadata"
  });

  const { fields: labels, append: appendLabels, replace: replaceLabels, remove: removeLabels } = useFieldArray({
    control: labelsControl,
    name: "labels",
  });
  
  const findPageInURL = new RegExp(`notes\/page\/([0-9]+)`);
  const findNoteIdInURL = new RegExp(`note\/(.*)`);

  const getPageInURL = findPageInURL.exec(location.pathname);
  const getNoteIdInURL = findNoteIdInURL.exec(location.pathname);
  
  useEffect(() => {
    if(getNoteIdInURL && !selectedNote) {
      setSelectedNote(getNoteIdInURL[1]);
      setNoteIsExpanded(innerWidth < 1030 ? true : false);
    }
  }, [getNoteIdInURL]);

  const prevPinNotesPage = useRef(1);

  //using these refs to prevent appending the same array two times
  const fetchedNotes = useRef(false);
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
        
        if(!pinDocs) replacePinNotes([]);
        else if (!pinNotes.length && pinDocs.length > 0) appendPinNotes(pinDocs);
        else replacePinNotes(pinDocs);
  
        if ((!fields.length && !fetchedNotes.current) || (docs.length > 0 && !fields.length)) {
          fetchedNotes.current = true;
          return append(docs);
        }
  
        //only replace the array if the pinnedNotesPage doesn't change
        if (fields.length > 0 && prevPinNotesPage.current === pinnedNotesPage) {
          return replace(docs);
        }
      } catch (err: any) {       
          console.log(err);
          toastAlert({ icon: "error", title: err.message, timer: 3000 });
      } 
    }
  };

  const fetchSelectedNoteData = async () => { 
    if(selectedNote && _id) {
      try {
        const { data: { note } } = await api.get(`/note/${selectedNote}`, {
          params: { 
            author: _id
          }
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

  const { isFetching: noteDataIsFetching } = useQuery(["fetchNoteData", selectedNote, getNoteIdInURL, _id], fetchSelectedNoteData, {
    refetchOnWindowFocus: false
  });

  const { isFetching: labelIsFetching } = useQuery(["fetchLabels", delayedSearchLabel, pageLabel, _id], fetchLabels, { 
    refetchOnWindowFocus: false 
  });

  const notesProps = {
    page,
    search,
    navbar,
    setPage,
    setSearch,
    totalDocs,
    setNavbar,
    isFetching,
    addNewNote,
    hasNextPage,
    notesMetadata: fields,
    totalPinnedDocs,
    pinnedNotes: pinNotes,
    expanded: noteIsExpanded,
    setExpanded: setNoteIsExpanded,
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
      <SelectedNoteContext 
        selectedNote={selectedNote} 
        setSelectedNote={setSelectedNote}
      >
        <LabelsCtx {...navLabelCtxProps}>
          <Nav
            labels={labels}
            navbar={navbar}
            addNewNote={addNewNote} 
            expanded={noteIsExpanded} 
            showSvgLoader={showLoaderOnNavbar}
          />
        </LabelsCtx>
        <div className={`!overflow-hidden ${(!isMobileDevice && !noteIsExpanded) && (!navbar || navbar) ? 'ml-[60px]' : "ml-0"}`} >
          <div className="flex flex-row h-screen">
            <Notes {...notesProps}/>
            <NavbarContext navbar={navbar} setNavbar={setNavbar}>
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
                    expanded={noteIsExpanded}
                    deleteNote={deleteNote} 
                    appendPinNotes={appendPinNotes}
                    removePinNotes={removePinNotes}
                    setExpanded={setNoteIsExpanded}
                    labelIsFetching={labelIsFetching}
                    selectedNoteData={selectedNoteData}
                    setPinnedNotesPage={setPinnedNotesPage}
                    noteDataIsFetching={noteDataIsFetching}
                  />
                </LabelsCtx>
              </RefetchContext>
            </NavbarContext>
          </div>
        </div>
      </SelectedNoteContext>
    </div>
  );
}