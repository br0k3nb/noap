import { forwardRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import { SettingsContext, useSettings } from "./context/SettingsContext";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./appThemes/PlaygroundEditorTheme";

import { Editor } from "./Editor";

const App = forwardRef((_, ref) => {
  const {
    settings: { isCollab, emptyEditor },
  } = useSettings();

  const initialConfig = {
    editorState: isCollab
      ? null
      : emptyEditor,
    namespace: "Playground",
    nodes: [...PlaygroundNodes],
    theme: PlaygroundEditorTheme,
    onError: (error) => {
      throw error;
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell">
              <Editor ref={ref} />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
});

const PlaygroundApp = forwardRef((_, ref) => {
  return (
    <SettingsContext>
      <App ref={ref} />
    </SettingsContext>
  );
});

export default PlaygroundApp;
