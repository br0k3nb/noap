import { useState, createContext, SetStateAction, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, useFieldArray } from "react-hook-form";

// import { motion } from "framer-motion";

import { toastAlert } from "../../components/Alert/Alert";

import Nav from "./components/Nav";
import Notes from "../Notes";
import NoteDetails from "../NoteDetails";

import api from "../../services/api";

import "../../styles/themes/dark.css";
import "../../styles/themes/light.css";

type SelectedNoteContext = {
  selectedNote: number;
  setSelectedNote: Dispatch<SetStateAction<number | null>>;
};

type NoteWasChangedContext = {
  wasChanged: boolean;
  setWasChanged: Dispatch<SetStateAction<boolean>>;
};

type NavContext = {
  navbar: boolean;
  setNavbar: Dispatch<SetStateAction<boolean>>;
};

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    image?: string;
    state: string;
    updatedAt?: string;
    createdAt: string;
  }[];
};

type Note = {
  _id: string;
  userId: string;
  title?: string;
  body: string;
  image?: string;
  state: string;
  updatedAt?: string;
  createdAt: string;
  id: string;
};

export const NoteWasChanged = createContext<NoteWasChangedContext | null>(null);
export const NoteContext = createContext<SelectedNoteContext | null>(null);
export const NavbarContext = createContext<NavContext | null>(null);

export default function Home(): JSX.Element {
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [wasChanged, setWasChanged] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [blurFlag, setBlurFlag] = useState(true);
  const [newNote, setNewNote] = useState(false);
  const [navbar, setNavbar] = useState(false);
  
  const navigate = useNavigate();

  const { control } = useForm<Notes>();

  const { fields, append, update, replace, remove } = useFieldArray({
    control,
    name: "note",
  });

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || "{}"
  );

  const fetchNotes = async () => {
    if (Object.keys(parsedUserToken).length === 0) return navigate("/");
    setBlurFlag(false);

    try {
      const notes = await api.get(
        `https://noap-typescript-api.vercel.app/notes/${parsedUserToken._id}/${parsedUserToken.token}`
      );

      if (fields.length === 0) append(notes.data);
      else if (fields.length >= 1) {
        notes.data.map((value: Note, index: number) => {
          
          //creating a condition checker by "hand" because i can't
          //just use value === fields[index], since useFieldArray
          //inserts it's own id into the array.
          const noteIsTheSame =
            value.body === fields[index]?.body &&
            value.title === fields[index].title &&
            value.createdAt === fields[index]?.createdAt &&
            value.updatedAt === fields[index]?.updatedAt &&
            value.state === fields[index]?.state;

          if (notes.data.length >= fields.length && fields.length - 1 < index) append(value);
          else if (notes.data.length < fields.length) replace(notes.data);
          else if (value._id === fields[index]._id && !noteIsTheSame) update(index, value);
          else if (value._id === fields[index]._id && noteIsTheSame) return;
        });
      }
    } catch (err) {
      console.log(err);
      navigate("/");
      window.localStorage.removeItem("user_token");
    }
  };

  const addNewNote = async () => {
    setNewNote(true);

    const defaultLexicalState =
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

    try {
      await api.post(
        `https://noap-typescript-api.vercel.app/add/${parsedUserToken.token}`,
        {
          title: "Untitled",
          body: "",
          image: "no image attached",
          state: defaultLexicalState,
          userId: parsedUserToken._id,
        }
      );

      setWasChanged(!wasChanged);
      setNewNote(false);
    } catch (err: any) {
      console.log(err);
      toastAlert({
        icon: "error",
        title: `${err.response.data.message}`,
        timer: 2000,
      });
    }
  };

  const deleteNote = async (_id: string) => {
    try {
      const deleteNote = await api.delete(
        `https://noap-typescript-api.vercel.app/delete/${_id}/${parsedUserToken.token}`
      );
      toastAlert({
        icon: "success",
        title: `${deleteNote.data.message}`,
        timer: 2000,
      });
    } catch (err: any) {
      toastAlert({
        icon: "error",
        title: `${err.response.data.message}`,
        timer: 2000,
      });
    }
  };

  const handleSignout = () => {
    window.localStorage.removeItem("user_token");
    navigate("/");
  };

  const {isFetching} = useQuery(["verifyUser", wasChanged], fetchNotes, {
    refetchInterval: 300000,
    refetchOnWindowFocus: true
  });

  return (
    <div className={`!h-screen ${blurFlag && 'blur-xl'}`}>
      <NoteWasChanged.Provider value={{ wasChanged, setWasChanged }}>
        {/* @ts-ignore */}
        <NoteContext.Provider value={{ selectedNote, setSelectedNote }}>
          <Nav 
            navbar={navbar}
            addNewNote={addNewNote} 
            expanded={expanded}
            newNote={newNote}
            handleSignout={handleSignout}
            userName={parsedUserToken?.name}
          />
          <div
            className={`!overflow-hidden ${
              navbar && !expanded ? "ml-[60px] xxs:ml-[60px]" : 
              !navbar && !expanded ? "ml-[60px] xxs:ml-0" :
              expanded && 'ml-0'
            }`}
            id="dark"
          >
            <div className="flex flex-row h-screen">
              <Notes 
                notes={fields} 
                addNewNote={addNewNote}
                isFetching={isFetching}
                navbar={navbar}
                setNavbar={setNavbar} 
                expanded={expanded}
              />
        
              <NavbarContext.Provider value={{ navbar, setNavbar }}>        
                <NoteDetails 
                  notes={fields} 
                  deleteNote={deleteNote} 
                  remove={remove}
                  expanded={expanded}
                  setExpanded={setExpanded}
                />
              </NavbarContext.Provider>
            </div>
          </div>
        </NoteContext.Provider>
      </NoteWasChanged.Provider>
    </div>
  );
}
