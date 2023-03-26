import {
  useState,
  useContext,
  createContext,
  SetStateAction,
  Dispatch,
} from "react";
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
  selectedNote: SeletedNote | null;
  setSelectedNote: Dispatch<SetStateAction<SeletedNote | null>>;
};

type SeletedNote = {
  _id: string;
  state: string;
};

export const NoteContext = createContext<SelectedNoteContext | null>(null);

export default function Activities() {
  type Theme = {
    setTheme: Dispatch<SetStateAction<string>>;
    theme: string;
  };

  const navigate = useNavigate();

  const [editId, setEditId] = useState<SetStateAction<string | boolean>>(false);
  const [deleteId, setDeleteId] = useState<SetStateAction<string | number | null>>(null);
  const [wasSaved, setWasSaved] = useState<SetStateAction<null | number | string>>(null);
  // const [wasUpdated, setWasUpdated] = useState<SetStateAction<string | boolean>>(false);
  const [selectedNote, setSelectedNote] = useState<SeletedNote | null>(null);
  const [navbar, setNavbar] = useState(false);

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

  const { register, handleSubmit, reset, watch, control } = useForm<Notes>();

  const { fields, append, update } = useFieldArray({
    control,
    name: "note",
    keyName: "UseFieldArrayId", //calling keyName here to avoid useFieldArray overwriting the existing id of the note
  });

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const getTk = async () => {
    try {
      if (parsedUserToken !== "") {
        const verifyTk = await api.get(
          `https://noap-typescript-api.vercel.app/notes/${parsedUserToken._id}/${parsedUserToken.token}`
        );

        append(verifyTk.data);
        console.log(verifyTk.data);
      } else return navigate("/");
    } catch (err) {
      navigate("/");
      window.localStorage.removeItem("user_token");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const deleteNote = await api.delete(
        `https://noap-typescript-api.vercel.app/delete/${id}/${parsedUserToken.token}`
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

  const handleCreate = async (data?: FieldValues) => {
    try {
      if (data) {
        const { title, body } = data;

        const create = await api.post(
          `https://noap-typescript-api.vercel.app/new-ac/${parsedUserToken.token}`,
          {
            title,
            body,
            userId: parsedUserToken._id,
          }
        );

        toastAlert({
          icon: "success",
          title: `${create.data.message}`,
          timer: 2000,
        });

        setWasSaved("true" + Math.random());
      }
    } catch (err: any) {
      console.log(err);
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

  // const handleTheme = (e: boolean) => {
  //   if (e === false) {
  //     theme?.setTheme("light");
  //     window.localStorage.setItem("theme", "light");
  //   }

  //   if (e === true) {
  //     theme?.setTheme("dark");
  //     window.localStorage.setItem("theme", "dark");
  //   }
  // };

  useQuery(
    ["verifyUser", editId, deleteId, wasSaved],
    getTk,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      // refetchInterval: 5000,
    }
  );

  return (
    <NoteContext.Provider value={{ selectedNote, setSelectedNote }}>
      <div
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // transition={{ duration: 0.5 }}
        id="dark"
        className="overflow-hidden"
      >
        <Nav
          append={append}
          notes={fields}
          navbar={navbar}
          setNavbar={setNavbar}
        />
        <div
          className={`h-screen xxs:ml-0 overflow ${
            !navbar ? "ml-[60px] xxs:ml-0" : "ml-[10rem] xxs:ml-[60px]"
          }`}
          id="dark"
        >
          <div className="flex flex-row">
            <Notes
              notes={fields}
              navbar={navbar}
              setNavbar={setNavbar}
            />

            <NoteDetails />
          </div>
        </div>
      </div>
    </NoteContext.Provider>
  );
}
