import { Dispatch, SetStateAction, useState } from "react";
import { FieldArrayWithId } from "react-hook-form";

import Compressor from 'compressorjs';
import imageCompression from 'browser-image-compression';

import FileInput from "./lexical/ui/FileInput";

import useSelectedNote from "../../../hooks/useSelectedNote";
import useRefetch from "../../../hooks/useRefetch";

import Modal from "../../../components/Modal";
import { toastAlert } from "../../../components/Alert";
import api from "../../../components/CustomHttpInterceptor";

type NoteInfoModalType = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  notes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[];
  pinNotes: FieldArrayWithId<NoteMetadata, "noteMetadata", "id">[]
};

export default function NoteInfoModal({ open, setOpen, notes, pinNotes }: NoteInfoModalType) {
    const { fetchNotes } = useRefetch();
    const { selectedNote } = useSelectedNote();

    const [image, setImage] = useState("");
    const [loader, setLoader] = useState(false);
  
    const note = notes.find(({ _id }) => _id === selectedNote) as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;
    const pinNote = pinNotes.find(({ _id }) => _id === selectedNote) as FieldArrayWithId<NoteMetadata, "noteMetadata", "id">;

    const { image: currentImage } = note ? note : pinNote || {};

    const loadImage = (files: FileList | null) => {
      if(files && files[0].size <= 5006613 && files[0].type.startsWith("image")) { //aprox 5mb
        setLoader(true);
        new Compressor(files[0], {      
          quality: 0.3,
          success: async (compressedResult) => {
            const options = {
              maxSizeMB: 0.2,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            }
            try {
              const compressedFile = await imageCompression(compressedResult as File, options);
                const reader = new FileReader();
                reader.onload = async function () {
                  if (typeof reader.result === "string") {
                    setLoader(false);
                    setImage(reader.result);
                  }
                  return "";
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
              console.log(error);
            }
          },
        });
      } else if(files && !files[0].type.startsWith("image")) {
        toastAlert({ icon: "error", title: `Only images are supported!`, timer: 3000 });
      } else {
        toastAlert({ icon: "error", title: `Image too large!`, timer: 3000 });
      }
    };

    const handleImage = async () => {
        try {
            setLoader(true);

            await api.post(`/note/image/${selectedNote}`, { image });
            toastAlert({ icon: "success", title: `Image updated!`, timer: 3000 });

            fetchNotes();
        } catch (err: any) {
            console.log(err);
            toastAlert({ icon: "error", title: err.message, timer: 3000 });
        } finally {
            setLoader(false);
        }
    };

    const handleDeleteImage = async () => {
      try {
        setLoader(true);

        await api.post(`/note/image/${selectedNote}`, { image: "" });
        toastAlert({ icon: "success", title: `Image updated!`, timer: 3000 });

        fetchNotes();
      } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: err.message, timer: 3000 });
      } finally {
        setLoader(false);
      }
    };

    return (
        <Modal
            open={open}
            setOpen={setOpen}
            title="Note image"
            options={{
              titleWrapperClassName: "!px-6",
              modalWrapperClassName: "px-0 !w-[22rem] !pb-2",
            }}
          >
            <div className="w-[320px] xxs:w-[275px] mx-auto mt-5">
                <FileInput
                    label="Upload image"
                    onChange={loadImage}
                    accept="image/*"
                    data-test-id="image-modal-file-upload"
                />
            </div>
            <div className="w-[320px] xxs:w-[275px] mx-auto mt-5">
              <button 
                  className="my-3 text-white rounded-full bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full disabled:opacity-50 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
                  disabled={(!image && !loader) && true}
                  onClick={() => {
                      if(!loader) handleImage();
                  }}
              >
                  {loader ? (
                      <p className="animate-pulse text-gray-300">Loading...</p>
                  ) : "Confirm"}
              </button>
              <button 
                  className="mt-1 mb-3 text-white rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 ease-in-out px-2 py-2 text-[15px] uppercase tracking-wide w-full disabled:opacity-50 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
                  disabled={(!currentImage && !loader) && true}
                  onClick={() => {
                    if(!loader) handleDeleteImage();
                  }}
              >
                  {loader ? (
                      <p className="animate-pulse text-gray-300">Loading...</p>
                  ) : "Delete current image"}
              </button>
            </div>
        </Modal>
    )
}