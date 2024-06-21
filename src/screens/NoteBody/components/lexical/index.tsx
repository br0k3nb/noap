import { useRef, useEffect, useState } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND, EditorState } from "lexical";

import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import NoapNodes from "./nodes/NoapNodes";
import { TableContext } from "./plugins/TablePlugin";
import EditorTheme from "./themes/EditorTheme";

import useRefetch from "../../../../hooks/useRefetch";
import useSelectedNote from "../../../../hooks/useSelectedNote";
import useNoteSettings from "../../../../hooks/useNoteSettings";
import useUserData from "../../../../hooks/useUserData";

import api from "../../../../services/api";

import { toastAlert } from "../../../../components/Alert";
import Editor from "./components/Editor";

type Props = { 
  noteData: NoteData;
};

export default function App({ noteData }: Props): JSX.Element {
  const editorRef = useRef<HTMLElement | null>(null);
  const lastSelectedNotes = useRef<string | null | undefined>(null);

  const [saveSpinner, setSaveSpinner] = useState(false);
  
  const { userData: { _id: userId } } = useUserData();
  const { setNoteSettings }  = useNoteSettings();
  const { selectedNote } = useSelectedNote();
  const { fetchNotes } = useRefetch();
  
  useEffect(() => { 
    lastSelectedNotes.current = selectedNote 
  }, [selectedNote]);

  useEffect(() => {
    async function patchLastSelectedNote() {
      await api.patch(`/lastOpenedNote/${userId}`, { lastOpenedNote: selectedNote });
    }
    patchLastSelectedNote();
  }, [selectedNote])
    
  const saveNote = async (currentState: EditorState) => {
    setSaveSpinner(true);

    if(!editorRef?.current) throw new Error("Editor error!");
    else {
      let imageSrc = '';
      const body = (editorRef?.current.firstChild as HTMLElement).children[0].innerHTML;
  
      const findImages = body.match(/<img[^>]+>/gm);
      const removeAllHTMLTags = body.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, "");
      const addSpaceBeforeCaptalLetters = removeAllHTMLTags.replace(/(?<=[a-z])(?=[A-Z0-9])/g, ' ').trim().toString().slice(0,136);
      const removeImageActionMenuText = addSpaceBeforeCaptalLetters.replace(/✕Download Fullscreen Delete/g, "");
      const removeLoadingStatusText = removeImageActionMenuText.replace(/loading\.\.\./g, "");
      const removeBottomBarText = removeLoadingStatusText.replace(/Detach all labels No labels attached!Save note Confirmation✕Are you sure you want to remove all labels attached to this note\?This action will only detach labels from this note!Cancel Delete/gm, "");
  
      if(findImages && findImages.length) {
        const regToGetSrcFromImg = new RegExp(/<img.*?src=["|'](.*?)["|']/);
        const srcFromImg = regToGetSrcFromImg.exec(findImages[0]) as RegExpExecArray;
  
        imageSrc = srcFromImg[1];
      }
      
      try {
        if (currentState) {
          setNoteSettings((prevSettings) => {
            return {
              ...prevSettings,
              status: "saving"
            }
          });

          const state = JSON.stringify(currentState);
          const { data: { message } } = await api.patch("/edit",
            {
              body: removeBottomBarText ? removeBottomBarText : '',
              image: imageSrc,
              state: state,
              _id: selectedNote,
              stateId: noteData.state._id
            }
          );
          
          fetchNotes();
          setSaveSpinner(false);
          
          toastAlert({ icon: "success", title: message, timer: 2000 });
        }
      } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: err.message, timer: 2000 });
      } finally {
        setNoteSettings((prevSettings) => {
          return {
            ...prevSettings,
            status: "editing"
          }
        });
      }
    }
  };

  const initialConfig = {
    editorState: undefined,
    namespace: "Noap",
    nodes: [...NoapNodes],
    onError: (error: Error) => { throw error },
    theme: EditorTheme,
  };

  const UpdatePlugin = () => {
    const [editor] = useLexicalComposerContext();

    if(lastSelectedNotes.current !== selectedNote) {
      setTimeout(() => {
        const editorState = editor.parseEditorState((noteData.state.state));
        editor.setEditorState(editorState);
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }); 
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell h-screen w-fit overflow-hidden absolute dark:!bg-[#0f1011] !bg-[#ffffff]">
              {/* @ts-ignore */}
              <UpdatePlugin />  
              <Editor 
                note={noteData} 
                ref={editorRef} 
                save={saveNote}
                saveSpinner={saveSpinner} 
              />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}