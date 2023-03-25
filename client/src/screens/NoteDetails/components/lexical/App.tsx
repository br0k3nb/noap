import { useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import { useSettings } from "./context/SettingsContext";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./appThemes/PlaygroundEditorTheme";

import api from "../../../../services/api";
import { alert, toastAlert } from "../../../../components/Alert/Alert";

import Editor from "./Editor";

export default function App(): JSX.Element {
  const editorState = useRef<any>();

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const teste = async (currentState: any) => {
    const string = editorState.current.lastElementChild.innerHTML;
    try {
      if (currentState) {
        const create = await api.post(`https://noap-typescript-api.vercel.app/new-ac/${parsedUserToken.token}`, {
          // title,
          body: string,
          state: JSON.stringify(currentState),
          userId: parsedUserToken._id,
        });

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

  // const {
  //   settings: { isCollab, emptyEditor },
  // } = useSettings();

  const initialConfig = {
    editorState: undefined,
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
              <Editor ref={editorState} props={teste} />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
