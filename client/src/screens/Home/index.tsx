import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, useFieldArray } from "react-hook-form";

import { toastAlert } from "../../components/Alert/Alert";

import Notes from "../Notes";
import Nav from "./Navbar";
import NoteDetails from "../NoteDetails";

import api from "../../services/api";

import { useDebounce } from "../../hooks/useDebounce";

import SelectedNoteContext from "../../context/SelectedNoteCtx";
import RefetchContext from "../../context/RefetchCtx";
import NavbarContext from "../../context/NavbarCtx";
import LabelsCtx from "../../context/LabelCtx";

import default_editor_state from "../../datasets/default_editor_state.json";

import "../../styles/themes/dark.css";
import "../../styles/themes/light.css";

export default function Home(): JSX.Element {
  const [ isMobileDevice, setIsMobileDevice ] = useState(window.innerWidth <= 640);
  const [ selectedNote, setSelectedNote ] = useState<string | null>(null);
  const [ showLoaderOnNavbar, setShowLoaderOnNavbar ] = useState(false);
  const [ hasNextPageLabel, setHasNextPageLabel ] = useState(false);
  const [ noteIsExpanded, setNoteIsExpanded ] = useState(false);  
  const [ hasNextPage, setHasNextPage ] = useState(false);
  const [ searchLabel, setSearchLabel ] = useState('');
  const [ pageLabel, setPageLabel ] = useState(1);
  const [ totalDocs, setTotalDocs ] = useState(0);
  const [ navbar, setNavbar ] = useState(false);
  const [ search, setSearch ] = useState('');
  const [ page, setPage ] = useState(1);

  const delayedSearchLabel = useDebounce(searchLabel, 500);
  const delayedSearch = useDebounce(search, 500);

  const navigate = useNavigate();
  const location = useLocation();

  const { control } = useForm<Notes>();
  const { control: labelsControl } = useForm<Labels>();

  const { fields, append, replace, remove } = useFieldArray({ control, name: "note" });

  const { fields: labels, append: appendLabels, replace: replaceLabels, remove: removeLabels } = useFieldArray({
    control: labelsControl,
    name: "labels",
  });

  const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
  const { _id } = parsedUserToken;

  const findPageInURL = new RegExp(`notes\/${_id}\/page\/([0-9]+)`);
  const getPageInURL = findPageInURL.exec(location.pathname);

  useEffect(() => {
    const updateViewPortWidth = () => setIsMobileDevice(window.innerWidth <= 640 ? true : false);

    window.addEventListener("resize", updateViewPortWidth);
    return () => window.removeEventListener("resize", updateViewPortWidth);
  }, []);

  const fetchNotes = async () => { 
    if(getPageInURL) setPage(Number(getPageInURL[1]));

    const pageUrl = getPageInURL ? getPageInURL[1] : 1;

    try {
      const { data: { docs, totalDocs, hasNextPage } } = await api.get(`/notes/${pageUrl}/${_id}`, { 
        params: { search: delayedSearch, limit: 10 }
      });

      setTotalDocs(totalDocs);
      setHasNextPage(hasNextPage);

      if (fields.length === 0) append(docs);
      else replace(docs);
    } catch (err: any) {
        if(err?.message.startsWith("Refetching")) toastAlert({ icon: "error", title: `${err.message}`, timer: 2000 });
        else {
          toastAlert({ icon: "error", title: `${err.response.data.message}`, timer: 2000 });
          signOutUser();
        }
    }
  };

  const fetchLabels = async () => {
    try {
        const {data: { docs, hasNextPage }} = await api.get(`/labels/${_id}`, { 
          params: { search: delayedSearchLabel, page: pageLabel, limit: 10 }
        });

        setHasNextPageLabel(hasNextPage);

        if (labels.length === 0) appendLabels(docs);
        else replaceLabels(docs);
    } catch (err: any) {
        if(err?.message.startsWith("Refetching")) toastAlert({ icon: "error", title: `${err?.message}`, timer: 2000 });
        else {
          toastAlert({ icon: "error", title: `${err?.message}`, timer: 2000 });
          signOutUser();
        }
    }
  }

  const addNewNote = async () => {
    setShowLoaderOnNavbar(true);

    try {
      await api.post(`/add`, {
          title: "Untitled",
          body: "",
          image: "no image attached",
          state: JSON.stringify(default_editor_state),
          author: _id,
        }
      );

      fetchNotes();
      setShowLoaderOnNavbar(false);
    } catch (err: any) {
      console.log(err);
      toastAlert({ icon: "error", title: `${err.response.data.message}`, timer: 2000 });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const deleteNote = await api.delete(`/delete/${noteId}`);
      toastAlert({ icon: "success", title: `${deleteNote.data.message}`, timer: 2000 });
    } catch (err: any) {
      toastAlert({ icon: "error", title: `${err.response.data.message}`, timer: 2000 });
    }
  };

  const signOutUser = () => {
    window.localStorage.removeItem("user_token");
    navigate("/");
  };

  const { isFetching } = useQuery(["verifyUser", delayedSearch, page, getPageInURL], fetchNotes, {
    refetchInterval: 300000,
    refetchOnWindowFocus: true
  });

  const { isFetching: labelIsFetching } = useQuery([ "fetchLabels", delayedSearchLabel, pageLabel ], fetchLabels, { 
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
    notes: fields,
    expanded: noteIsExpanded,
    setExpanded: setNoteIsExpanded
  }

  const navLabelCtxProps = {
    pageLabel,
    searchLabel,
    fetchLabels,
    removeLabels,
    setPageLabel,
    labelIsFetching,
    setSearchLabel,
    hasNextPageLabel
  }

  return (
    <div className={`!h-screen`}>
      <SelectedNoteContext selectedNote={selectedNote} setSelectedNote={setSelectedNote}>
        <LabelsCtx {...navLabelCtxProps}>
          <Nav
            labels={labels}
            navbar={navbar}
            addNewNote={addNewNote} 
            expanded={noteIsExpanded} 
            showSvgLoader={showLoaderOnNavbar}
          />
        </LabelsCtx>
        <div
          className={`!overflow-hidden ${(!isMobileDevice && !noteIsExpanded) && (!navbar || navbar) ? 'ml-[60px]' : "ml-0"}`}
          id="dark"
        >
          <div className="flex flex-row h-screen">
            <Notes {...notesProps}/>
            <NavbarContext navbar={navbar} setNavbar={setNavbar}>
              <RefetchContext fetchNotes={fetchNotes}>
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
                    labels={labels}
                    expanded={noteIsExpanded}
                    deleteNote={deleteNote} 
                    setExpanded={setNoteIsExpanded}
                    labelIsFetching={labelIsFetching}
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