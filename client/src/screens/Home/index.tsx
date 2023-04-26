import { useState, createContext, SetStateAction, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, useFieldArray, FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";

// import { motion } from "framer-motion";

import { toastAlert } from "../../components/Alert/Alert";

import Notes from "../Notes";
import Nav from "./components/nav";
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
    labels?: {
      _id: string;
      name: string;
      type: string;
      color: string;
      fontColor: string;
    };
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
  labels?: {
    _id: string;
    name: string;
    type: string;
    color: string;
    fontColor: string;
  };
  updatedAt?: string;
  createdAt: string;
  id: string;
};

type Labels = {
  labels: {
    _id: string;
    userId: string;
    name: string;
    color: string;
    fontColor?: string;
    type: string;
    updatedAt?: string;
    createdAt: string;
  }[];
};

type LabelContext = {
  isFetching: boolean;
  fetchLabels: () => Promise<void>;
  removeLabels: UseFieldArrayRemove; 
  labels: FieldArrayWithId<Labels, "labels", "id">[];
}

type Refetch = {
  fetchNotes: () => Promise<void>;
}

export const NoteWasChanged = createContext<NoteWasChangedContext | null>(null);
export const NoteContext = createContext<SelectedNoteContext | null>(null);
export const NavbarContext = createContext<NavContext | null>(null);
export const LabelsContext = createContext<LabelContext | null>(null);
export const RefetchContext = createContext<Refetch | null>(null);

export default function Home(): JSX.Element {
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [wasChanged, setWasChanged] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [blurFlag, setBlurFlag] = useState(true);
  const [newNote, setNewNote] = useState(false);
  const [navbar, setNavbar] = useState(false);
  
  const navigate = useNavigate();

  const { control } = useForm<Notes>();

  const { control: labelsControl } = useForm<Labels>();

  const { fields, append, update, replace, remove } = useFieldArray({
    control,
    name: "note",
  });

  const { fields: labels,
      append: appendLabels,
      update: updateLabels,
      replace: replaceLabels,
      remove: removeLabels } = useFieldArray({
    control: labelsControl,
    name: "labels",
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
            value.state === fields[index]?.state &&
            value.labels === fields[index]?.labels;

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

  const fetchLabels = async () => {
    try {
        const getLabels = await api.get(`/labels/${parsedUserToken._id}/${parsedUserToken.token}`);

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
    }
}

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

  const { isFetching: labelIsFetching } = useQuery(["fetchLabels", wasChanged], fetchLabels, {
    refetchOnWindowFocus: false
  });

  return (
    <div className={`!h-screen ${blurFlag && 'blur-xl'}`}>
      <NoteWasChanged.Provider value={{ wasChanged, setWasChanged }}>
        {/* @ts-ignore */}
        <NoteContext.Provider value={{ selectedNote, setSelectedNote }}>
          <LabelsContext.Provider value={{ labels, removeLabels, fetchLabels, isFetching: labelIsFetching }}>
            <Nav 
              navbar={navbar}
              addNewNote={addNewNote} 
              expanded={expanded}
              newNote={newNote}
              handleSignout={handleSignout}
              token={parsedUserToken}
            />
          </LabelsContext.Provider>
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
                <RefetchContext.Provider value={{ fetchNotes }}>
                  <NoteDetails 
                    notes={fields} 
                    remove={remove}
                    labels={labels}
                    expanded={expanded}
                    deleteNote={deleteNote} 
                    setExpanded={setExpanded}
                    labelIsFetching={labelIsFetching}
                  />
                </RefetchContext.Provider>
              </NavbarContext.Provider>
            </div>
          </div>
        </NoteContext.Provider>
      </NoteWasChanged.Provider>
    </div>
  );
}
