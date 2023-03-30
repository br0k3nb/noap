import { useRef, useContext, Dispatch, SetStateAction } from "react";
import { FieldArrayWithId } from "react-hook-form";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";

import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./appThemes/PlaygroundEditorTheme";

import api from "../../../../services/api";
import { NoteWasChanged } from "../../../Home";
import { NoteContext } from "../../../Home";
import { toastAlert } from "../../../../components/Alert/Alert";

import Editor from "./Editor";

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

type Props = {
  notes: FieldArrayWithId<Notes, "note", "id">[];
};

type NoteWasChangedContext = {
  wasChanged: boolean;
  setWasChanged: Dispatch<SetStateAction<boolean>>;
};

export default function App({ notes }: Props): JSX.Element {
  const editorRef = useRef<any>(null);
  const noteWasChangedContext = useContext<NoteWasChangedContext | null>(NoteWasChanged);
  const noteContext = useContext(NoteContext);

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const saveNote = async (currentState: any) => {
    const string = editorRef?.current.lastElementChild.innerHTML;

    //this is for react stop complaining about not being able to control the nodes
    const removeContentEditableTrueString = string.replace(
      'contentEditable="true"',
      ""
    );
    const finalString = removeContentEditableTrueString.replace(
      'contentEditable="false"',
      ""
    );

    try {
      if (currentState) {
        const create = await api.patch(
          `https://noap-typescript-api.vercel.app/edit/${parsedUserToken.token}`,
          {
            // title,
            body: finalString,
            state: JSON.stringify(currentState),
            _id: notes[(noteContext?.selectedNote as number)]._id 
          }
        );

        noteWasChangedContext?.setWasChanged(!noteWasChangedContext.wasChanged);

        toastAlert({
          icon: "success",
          title: `${create.data.message}`,
          timer: 2000,
        });
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

  const initialConfig = {
    editorState: undefined,
    namespace: "Noap",
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  const UpdatePlugin = () => {
    const [editor] = useLexicalComposerContext();
  
    setTimeout(() => {
      const editorState = editor.parseEditorState(JSON.parse(notes[(noteContext?.selectedNote as number)].state));
      editor.setEditorState(editorState);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);  
    }, 0);
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell">
              {/* @ts-ignore */}
              <UpdatePlugin/>
              <Editor ref={editorRef} save={saveNote} />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}