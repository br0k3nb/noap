import { useRef, useEffect, useState, useContext } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";

import { pack, unpack } from "msgpackr";

import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";

import useSelectedNote from "../../../../hooks/useSelectedNote";

import { toastAlert } from "../../../../components/Alert/Alert";
import { RefetchCtx } from "../../../../context/RefetchCtx";

import api from "../../../../services/api";

import Editor from "./components/Editor";

type Props = { 
  noteData: NoteData;
};

export default function App({ noteData }: Props): JSX.Element {
  const editorRef = useRef<any>(null);
  const lastSelectedNotes = useRef<string | null | undefined>(null);

  const [saveSpinner, setSaveSpinner] = useState(false);
  
  const { selectedNote } = useSelectedNote();
  const refetchNoteCtx = useContext(RefetchCtx);
  
  useEffect(() => { lastSelectedNotes.current = selectedNote }, [selectedNote]);
    
    const saveNote = async (currentState: any) => {
      setSaveSpinner(true);

      let imageSrc = '';
      
      const body = editorRef?.current.firstChild.children[0].innerHTML;

      const findImages = body.match(/<img[^>]+>/gm);

      const removeAllHTMLTags = body.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, "");
      const addSpaceBeforeCaptalLetters = removeAllHTMLTags.replace(/(?<=[a-z])(?=[A-Z0-9])/g, ' ').trim().toString();
      const removeImageActionMenuText = addSpaceBeforeCaptalLetters.replace(/✕Download Fullscreen Delete/g, "");
      const removeLoadingStatusText = removeImageActionMenuText.replace(/loading\.\.\./g, "");
      const removeBottomBarText = removeLoadingStatusText.replace(/Detach all labels No labels attached!Save note Confirmation✕Are you sure you want to remove all labels attached to this note\?This action will only detach labels from this note!Cancel Delete/gm, "");

      if(findImages && findImages.length !== 0) {
        const regToGetSrcFromImg = new RegExp(/<img.*?src=["|'](.*?)["|']/);
        const srcFromImg = regToGetSrcFromImg.exec(findImages[0]) as any;

        imageSrc = srcFromImg[1];
      }
      
      try {
        if (currentState) {        
          const state = JSON.stringify(currentState);
          
          const compressState = pack({ state });
          const resultState = unpack(compressState);

          const { data: { message } } = await api.patch("/edit",
            {
              body: removeBottomBarText ? removeBottomBarText.slice(0,136) : '',
              image: imageSrc,
              state: resultState.state,
              _id: selectedNote,
              stateId: noteData.state._id
            }
          );
          
          refetchNoteCtx?.fetchNotes();
          setSaveSpinner(false);
          
          toastAlert({ icon: "success", title: message, timer: 2000 });
        }
      } catch (err: any) {
        console.log(err);
        toastAlert({ icon: "error", title: err.message, timer: 2000 });
      }
  };

  const initialConfig = {
    editorState: undefined,
    namespace: "Noap",
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => { throw error },
    theme: PlaygroundEditorTheme,
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