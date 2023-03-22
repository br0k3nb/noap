import { useState, useContext, SetStateAction, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm, FieldValues } from "react-hook-form";

import {
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  FormControlLabel,
  InputLabel,
  FormLabel,
  Checkbox,
} from "@mui/material";

import { Add, Settings } from "@mui/icons-material";

import { motion } from "framer-motion";

import { alert, toastAlert } from "../../components/Alert/Alert";
import {
  DialogBody,
  TitleDialog,
  ContentDialog,
  ActionsDialog,
} from "../../components/Dialog";
import { ThemeContext } from "../../App";
import Nav from "./components/Nav";
import Notes from "../Notes";
import NoteDetails from "../NoteDetails";

import api from "../../services/api";

import "../../styles/themes/dark.css";
import "../../styles/themes/light.css";

export default function Activities() {
  type Theme = {
    setTheme: Dispatch<SetStateAction<string>>;
    theme: string;
  };

  const theme = useContext<Theme | null>(ThemeContext);

  const navigate = useNavigate();

  const [activities, setAct] = useState([]);
  const [editId, setEditId] = useState<SetStateAction<string | boolean>>(false);
  const [deleteId, setDeleteId] = useState<SetStateAction<string | number | null>>(null);
  const [open, setOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [wasSaved, setWasSaved] = useState<SetStateAction<null | number | string>>(null);
  const [wasUpdated, setWasUpdated] = useState<SetStateAction<string | boolean>>(false);
  const [themeVal, setThemeVal] = useState(true);
  const [navbar, setNavbar] = useState(false);

  const defaultValues = {
    title: "",
    body: "",
    bookmark: true,
    bookmarkColor: "",
  };

  type Activity = {
    _id: string;
    title: string;
    body: string;
    bookmark: boolean;
    bookmarkColor: string;
    themeSwitch?: boolean;
  };

  const { register, handleSubmit, reset, watch } = useForm<Activity>({
    defaultValues,
  });

  const getTheme = window.localStorage.getItem("theme");

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const bookmark = watch("bookmark", true);
  const bookmarkColor = watch("bookmarkColor");
  const themeValue = watch("themeSwitch");

  const getTk = async () => {
    try {
      if (getTheme !== null)
        reset({ themeSwitch: getTheme === "light" ? false : true });
      else reset({ themeSwitch: true });

      if (parsedUserToken !== "") {
        const verifyTk = await api.get(
          `https://noap-typescript-api.vercel.app/activities/${parsedUserToken._id}/${parsedUserToken.token}`
        );

        setAct(verifyTk.data);
      } else return navigate("/");
    } catch (err) {
      navigate("/");
      window.localStorage.removeItem("user_token");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(false);
    reset({
      title: "",
      body: "",
      bookmark: true,
      bookmarkColor: "",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const deleteNote = await api.delete(
        `https://noap-typescript-api.vercel.app/de-ac/${id}/${parsedUserToken.token}`
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

  const handleUpdate = async (data?: FieldValues | string) => {
    try {
      if (typeof data === "string") {
        activities.map((val: Activity) => {
          if (val._id === data) {
            reset({
              title: val?.title,
              body: val?.body,
              bookmark: val?.bookmark,
              bookmarkColor: val?.bookmarkColor,
            });
          }
        });

        setOpen(true);
      } else {
        const updateNote = await api.put(
          `https://noap-typescript-api.vercel.app/up-ac/${parsedUserToken.token}`,
          {
            title: data?.title,
            body: data?.body,
            bookmark,
            bookmarkColor,
            id: editId,
            token: parsedUserToken.token,
          }
        );

        setWasUpdated(editId);

        toastAlert({
          icon: "success",
          title: `${updateNote.data}`,
          timer: 2000,
        });
      }
    } catch (err: any) {
      toastAlert({ icon: "error", title: `${err.response.data}`, timer: 2000 });
    }
  };

  const handleCreate = async (data?: FieldValues) => {
    try {
      if (data) {
        const { title, body } = data;

        const create = await api.post(
          `https://noap-typescript-api.vercel.app/new-ac/${parsedUserToken.token}`,
          {
            title,
            body,
            bookmark,
            bookmarkColor,
            userId: parsedUserToken._id,
          }
        );

        toastAlert({
          icon: "success",
          title: `${create.data.message}`,
          timer: 2000,
        });

        setWasSaved("true" + Math.random());

        reset({
          title: "",
          body: "",
          bookmark: true,
          bookmarkColor: "",
        });
      } else setOpen(true);
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

  const handleTheme = (e: boolean) => {
    if (e === false) {
      theme?.setTheme("light");
      window.localStorage.setItem("theme", "light");
    }

    if (e === true) {
      theme?.setTheme("dark");
      window.localStorage.setItem("theme", "dark");
    }
  };

  useQuery(
    ["verifyUser", editId, deleteId, wasSaved, themeValue, wasUpdated],
    getTk,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      // refetchInterval: 5000,
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      id={theme?.theme}
      className="overflow-hidden"
    >
      <Nav
        navbar={navbar}
        setNavbar={setNavbar}
        handleCreate={handleCreate}
        setAnchorEl={setAnchorEl}
        anchorEl={anchorEl}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        theme={theme}
        setOpenSettings={setOpenSettings}
      />
      <div
        className={`h-screen xxs:ml-0 overflow ${
          !navbar ? "ml-[60px] xxs:ml-0" : "ml-[10rem] xxs:ml-[60px]"
        }`}
        id={theme?.theme}
      >
        <div className="flex flex-row">
          <Notes
            activities={activities}
            navbar={navbar}
            setNavbar={setNavbar}
          />

          <NoteDetails />
        </div>
      </div>

      {/* <DialogBody open={open} onClose={handleClose}>
        <TitleDialog
          closeBtn={handleClose}
          style={
            theme?.theme === "dark"
              ? { backgroundColor: "#4c4c4c", color: "#EEEEEE" }
              : undefined
          }
        >
          <Typography style={{ letterSpacing: -1, fontSize: 22 }}>
            {editId ? "Edit note" : "Add a new note"}
          </Typography>
        </TitleDialog>
        <ContentDialog
          style={
            theme?.theme === "dark"
              ? { backgroundColor: "#4c4c4c", color: "#EEEEEE" }
              : undefined
          }
        >
          <Box
            component="form"
            onSubmit={
              editId ? handleSubmit(handleUpdate) : handleSubmit(handleCreate)
            }
          >
            <Box className="form-group mb-3">
              <InputLabel
                required
                className={
                  theme?.theme === "dark"
                    ? "a-class-with-black-text-set-as-important mb-2"
                    : "a-class-with-black-text-set-as-important-light mb-2"
                }
              >
                Title
              </InputLabel>
              <TextField
                inputProps={{
                  className:
                    theme?.theme === "dark"
                      ? "a-class-with-black-text-set-as-important"
                      : "a-class-with-black-text-set-as-important-light",
                }}
                type="text"
                placeholder="Title"
                autoComplete="false"
                fullWidth
                required
                {...register("title")}
              />
            </Box>

            <Box className="form-group mb-4">
              <InputLabel
                required
                className={
                  theme?.theme === "dark"
                    ? "a-class-with-black-text-set-as-important mb-2"
                    : "a-class-with-black-text-set-as-important-light mb-2"
                }
              >
                {" "}
                Content
              </InputLabel>
              <TextField
                inputProps={{
                  className:
                    theme?.theme === "dark"
                      ? "a-class-with-black-text-set-as-important"
                      : "a-class-with-black-text-set-as-important-light",
                }}
                multiline
                placeholder="Content"
                fullWidth
                required
                {...register("body")}
              />
            </Box>

            <Grid container>
              <Grid item md={12}>
                <FormControlLabel
                  style={{ padding: 0, margin: 0 }}
                  labelPlacement="start"
                  control={<Checkbox defaultChecked />}
                  label="Activate bookmark"
                  {...register("bookmark")}
                />
                {bookmark === true && (
                  <>
                    <Box>
                      <FormLabel style={{ color: "white" }}>
                        Choose the color:{" "}
                      </FormLabel>
                      <input
                        {...register("bookmarkColor")}
                        type="color"
                        style={{
                          transform: "translate(10px, 10px)",
                          borderWidth: "1px",
                          borderRadius: "4%",
                          padding: 0,
                          width: "150px",
                        }}
                      />
                    </Box>
                  </>
                )}
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              className="text-uppercase mb-2 mt-3 rounded-pill shadow"
              fullWidth
              style={
                theme?.theme === "dark"
                  ? { backgroundColor: "#141414", color: "#EEEEEE" }
                  : undefined
              }
            >
              {editId !== null ? "Edit" : "Add"}
            </Button>
          </Box>
        </ContentDialog>
      </DialogBody>

      <DialogBody
        maxWidth="xs"
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      >
        <TitleDialog
          closeBtn={() => setOpenSettings(false)}
          style={
            theme?.theme === "dark"
              ? { backgroundColor: "#4c4c4c", color: "#EEEEEE" }
              : undefined
          }
        >
          <Typography style={{ letterSpacing: -1, fontSize: 22 }}>
            Settings
          </Typography>
        </TitleDialog>
        <ContentDialog
          style={
            theme?.theme === "dark"
              ? { backgroundColor: "#4c4c4c", color: "#EEEEEE" }
              : undefined
          }
        >
          <Box>
            <Typography
              style={{
                display: "block",
              }}
            >
              Theme
             
            </Typography>

            <Button
              variant="contained"
              style={{ marginTop: 10, marginBottom: 5 }}
            >
              Change profile picture
            </Button>
          </Box>
        </ContentDialog>
        <ActionsDialog
          style={
            theme?.theme === "dark"
              ? { backgroundColor: "#4c4c4c", color: "#EEEEEE" }
              : undefined
          }
        >
          <Button
            variant="contained"
            className="text-uppercase mb-2 mt-3 rounded-pill shadow"
            fullWidth
            style={
              theme?.theme === "dark"
                ? { backgroundColor: "#141414", color: "#EEEEEE", fontSize: 14 }
                : undefined
            }
            onClick={() => setOpenSettings(false)}
          >
            Save
          </Button>
        </ActionsDialog>
      </DialogBody> */}
    </motion.div>
  );
}