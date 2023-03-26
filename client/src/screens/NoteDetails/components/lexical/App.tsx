import { useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./appThemes/PlaygroundEditorTheme";

import api from "../../../../services/api";
import { alert, toastAlert } from "../../../../components/Alert/Alert";

import Editor from "./Editor";

type currentNote = {
  _id: string;
  state: string;
};

export default function App({ _id, state }: currentNote): JSX.Element {
  const editorRef = useRef<any>(null);

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const saveNote = async (currentState: any) => {
    const string = editorRef?.current.lastElementChild.innerHTML;

    //this is for react stop complaining about not being able to control the nodes
    const removeContentEditableTrueString = string.replace('contentEditable="true"', '');
    const finalString = removeContentEditableTrueString.replace('contentEditable="false"', '');

    try {
      if (currentState) {
        const create = await api.post(
          `https://noap-typescript-api.vercel.app/add/${parsedUserToken.token}`,
          {
            // title,
            body: finalString,
            state: JSON.stringify(currentState),
            userId: parsedUserToken._id,
          }
        );

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
    editorState: JSON.parse(state),
    namespace: "Noap",
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell">
              {/* @ts-ignore */}
              <Editor ref={editorRef} save={saveNote} />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
