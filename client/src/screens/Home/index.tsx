import { useState, createContext, SetStateAction, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, FieldValues, useFieldArray } from "react-hook-form";

// import { motion } from "framer-motion";

import { alert, toastAlert } from "../../components/Alert/Alert";

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

type NoteWasSavedContext = {
  wasSaved: boolean;
  setWasSaved: Dispatch<SetStateAction<boolean>>;
};

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
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
  state: string;
  updatedAt?: string;
  createdAt: string;
  id: string;
};

export const NoteContext = createContext<SelectedNoteContext | null>(null);
export const NoteWasSaved = createContext<NoteWasSavedContext | null>(null);

export default function Activities(): JSX.Element {
  const navigate = useNavigate();
  const defaultLexicalState =
    '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [wasSaved, setWasSaved] = useState(false);
  const [navbar, setNavbar] = useState(false);

  const { control } = useForm<Notes>();

  const { fields, append, update, replace, remove } = useFieldArray({
    control,
    name: "note",
  });

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const fetchNotes = async () => {
    if (parsedUserToken === "") return navigate("/");

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
            value.createdAt === fields[index]?.createdAt &&
            value.state === fields[index]?.state;

          if (notes.data.length >= fields.length && fields.length - 1 < index)
            append(value);
          else if (notes.data.length < fields.length) replace(notes.data);
          else if (value._id === fields[index]._id && !noteIsTheSame)
            update(index, value);
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
    try {
      await api.post(
        `https://noap-typescript-api.vercel.app/add/${parsedUserToken.token}`,
        {
          // title,
          body: "",
          state: defaultLexicalState,
          userId: parsedUserToken._id,
        }
      );

      setWasSaved(!wasSaved);

      append({
        // title,
        _id: String(fields.length), //setting a temporary _id for now. the real _id will be fetched from the db
        body: "",
        state: defaultLexicalState,
        userId: parsedUserToken._id as string,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.log(err);
    }
  };

  // const handleDelete = async (id: string) => {
  //   try {
  //     const deleteNote = await api.delete(
  //       `https://noap-typescript-api.vercel.app/delete/${id}/${parsedUserToken.token}`
  //     );
  //     toastAlert({
  //       icon: "success",
  //       title: `${deleteNote.data.message}`,
  //       timer: 2000,
  //     });
  //   } catch (err: any) {
  //     toastAlert({
  //       icon: "error",
  //       title: `${err.response.data.message}`,
  //       timer: 2000,
  //     });
  //   }
  // };

  // const handleUpdate = async (data?: FieldValues | string) => {
  //   try {
  //     if (typeof data === "string") {
  //       activities.map((val: Notes) => {
  //         if (val._id === data) {
  //           reset({
  //             title: val?.title,
  //             body: val?.body,
  //           });
  //         }
  //       });

  //       setOpen(true);
  //     } else {
  //       const updateNote = await api.put(
  //         `https://noap-typescript-api.vercel.app/update/${parsedUserToken.token}`,
  //         {
  //           title: data?.title,
  //           body: data?.body,
  //           id: editId,
  //           token: parsedUserToken.token,
  //         }
  //       );

  //       setWasUpdated(editId);

  //       toastAlert({
  //         icon: "success",
  //         title: `${updateNote.data}`,
  //         timer: 2000,
  //       });
  //     }
  //   } catch (err: any) {
  //     toastAlert({ icon: "error", title: `${err.response.data}`, timer: 2000 });
  //   }
  // };

  const handleSignout = () => {
    window.localStorage.removeItem("user_token");
    navigate("/");
  };

  useQuery(["verifyUser", wasSaved], fetchNotes, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return (
    <NoteWasSaved.Provider value={{ wasSaved, setWasSaved }}>
      {/* @ts-ignore */}
      <NoteContext.Provider value={{ selectedNote, setSelectedNote }}>
        <div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // transition={{ duration: 0.5 }}
          id="dark"
          className="overflow-hidden"
        >
          <Nav navbar={navbar} setNavbar={setNavbar} addNewNote={addNewNote} />
          <div
            className={`h-screen xxs:ml-0 overflow ${
              !navbar ? "ml-[60px] xxs:ml-0" : "ml-[10rem] xxs:ml-[60px]"
            }`}
            id="dark"
          >
            <div className="flex flex-row">
              <Notes notes={fields} navbar={navbar} setNavbar={setNavbar} />

              <NoteDetails notes={fields}/>
            </div>
          </div>
        </div>
      </NoteContext.Provider>
    </NoteWasSaved.Provider>
  );
}
