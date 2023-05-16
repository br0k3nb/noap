import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, useFieldArray } from "react-hook-form";

import { toastAlert } from "../../components/Alert/Alert";

import Notes from "../Notes";
import Nav from "./components/nav";
import NoteDetails from "../NoteDetails";

import api from "../../services/api";

import { useDebounce } from "../../hooks/useDebounce";

import SelectedNoteContext from "../../context/SelectedNoteCtx";
import LabelsCtx from "../../context/LabelCtx";
import RefetchContext from "../../context/RefetchCtx";
import NavbarContext from "../../context/NavbarCtx";

import "../../styles/themes/dark.css";
import "../../styles/themes/light.css";

export default function Home(): JSX.Element {
  const [ selectedNote, setSelectedNote ] = useState<number | null>(null);
  const [ showLoaderOnNavbar, setShowLoaderOnNavbar ] = useState(false);
  const [ noteIsExpanded, setNoteIsExpanded ] = useState(false);
  const [ hasNextPage, setHasNextPage ] = useState(false);
  const [ blurFlag, setBlurFlag ] = useState(true);
  const [ totalDocs, setTotalDocs ] = useState(0);
  const [ navbar, setNavbar ] = useState(false);
  const [ search, setSearch ] = useState('');
  const [ page, setPage ] = useState(1);
  
  const delayedSearch = useDebounce(search, 500);

  const navigate = useNavigate();

  const { control } = useForm<Notes>();
  const { control: labelsControl } = useForm<Labels>();

  const { fields, append, replace, remove } = useFieldArray({
    control,
    name: "note",
  });

  const { fields: labels, append: appendLabels, update: updateLabels, replace: replaceLabels, remove: removeLabels } = useFieldArray({
    control: labelsControl,
    name: "labels",
  });

  const parsedUserToken = JSON.parse(window.localStorage.getItem("user_token") || "{}");
  if (Object.keys(parsedUserToken).length === 0) navigate("/");
  
  const { token, _id } = parsedUserToken;

  const fetchNotes = async () => { 
    setBlurFlag(false);
    try {
      const { data: { docs, totalDocs, hasNextPage } } = await api.get(`/notes/${_id}/${token}`, { 
        params: { search: delayedSearch, page, limit: 10 }
      });

      setTotalDocs(totalDocs);
      setHasNextPage(hasNextPage);

      if (fields.length === 0) append(docs);
      else replace(docs);
    } catch (err) {
      console.log(err);
      signOutUser();
    }
  };

  const fetchLabels = async () => {
    try {
        const getLabels = await api.get(`/labels/${_id}/${token}`);

        if (labels.length === 0) appendLabels(getLabels.data);
        else if (labels.length >= 1) {
            getLabels.data.map((value: any, index: number) => {
    
            //creating a condition checker by "hand" because i can't
            //just use value === labels[index], since useFieldArray
            //inserts it's own id into the array.
            const labelIsTheSame =
                value.name === labels[index]?.name &&
                value.color === labels[index]?.color &&
                value?.fontColor === labels[index]?.fontColor &&
                value.type === labels[index]?.type 

            if (getLabels.data.length > labels.length && labels.length - 1 < index) appendLabels(value);
            else if (getLabels.data.length < labels.length) replaceLabels(getLabels.data);
            else if (getLabels.data[index]._id === labels[index]?._id && !labelIsTheSame) updateLabels(index, value);
            else if (getLabels.data.length === labels.length && labelIsTheSame) return;
          });
        }
    } catch (err) {
      console.log(err);
      signOutUser();
    }
}

  const addNewNote = async () => {
    setShowLoaderOnNavbar(true);
    const defaultLexicalState = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

    try {
      await api.post(`/add/${token}`,
        {
          title: "Untitled",
          body: "",
          image: "no image attached",
          state: defaultLexicalState,
          userId: _id,
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
      const deleteNote = await api.delete(`/delete/${noteId}/${token}`);
      toastAlert({ icon: "success", title: `${deleteNote.data.message}`, timer: 2000 });
    } catch (err: any) {
      toastAlert({ icon: "error", title: `${err.response.data.message}`, timer: 2000 });
    }
  };

  const signOutUser = () => {
    window.localStorage.removeItem("user_token");
    navigate("/");
  };

  const { isFetching } = useQuery([ "verifyUser", delayedSearch, page ], fetchNotes, {
    refetchInterval: 300000,
    refetchOnWindowFocus: true
  });

  const { isFetching: labelIsFetching } = useQuery([ "fetchLabels" ], fetchLabels, {
    refetchOnWindowFocus: false
  });

  return (
    <div className={`!h-screen ${blurFlag && 'blur-xl'}`}>
      <SelectedNoteContext selectedNote={selectedNote} setSelectedNote={setSelectedNote}>
        <LabelsCtx labels={labels} removeLabels={removeLabels} fetchLabels={fetchLabels} isFetching={labelIsFetching}>
          <Nav navbar={navbar} addNewNote={addNewNote}  expanded={noteIsExpanded} showSvgLoader={showLoaderOnNavbar}/>
        </LabelsCtx>
        <div
          className={`!overflow-hidden ${
            navbar && !noteIsExpanded ? "ml-[60px] xxs:ml-[60px]" : 
            !navbar && !noteIsExpanded ? "ml-[60px] xxs:ml-0" :
            noteIsExpanded && 'ml-0'
          }`}
          id="dark"
        >
          <div className="flex flex-row h-screen">
            <Notes 
              page={page}
              search={search}
              setPage={setPage}
              totalDocs={totalDocs}
              hasNextPage={hasNextPage}
              setSearch={setSearch}
              notes={fields} 
              addNewNote={addNewNote}
              isFetching={isFetching}
              navbar={navbar}
              setNavbar={setNavbar} 
              expanded={noteIsExpanded}
              setExpanded={setNoteIsExpanded}
            />
      
            <NavbarContext navbar={navbar} setNavbar={setNavbar}>
              <RefetchContext fetchNotes={fetchNotes}>
                <NoteDetails 
                  notes={fields} 
                  remove={remove}
                  labels={labels}
                  expanded={noteIsExpanded}
                  deleteNote={deleteNote} 
                  setExpanded={setNoteIsExpanded}
                  labelIsFetching={labelIsFetching}
                />
              </RefetchContext>
            </NavbarContext>
          </div>
        </div>
      </SelectedNoteContext>
    </div>
  );
}
