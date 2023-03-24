import { useState, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import { useSettings } from "./context/SettingsContext";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./appThemes/PlaygroundEditorTheme";

import api from "../../../../services/api";
import { useQuery } from "react-query";

import Editor from "./Editor";

export default function App(): JSX.Element {
  let currentNoteState = '{}';

  const {
    settings: { isCollab, emptyEditor },
  } = useSettings();

  const initialConfig = {
    editorState: currentNoteState !== '{}' ? currentNoteState : isCollab ? null : emptyEditor ? undefined : undefined,
    namespace: "Noap",
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  const fetchInitialData = async () => {
    const getNote = await api.get(`/note/641d0dd64b2a0888552b3967`);
    currentNoteState = JSON.stringify(getNote.data);
  };

  useQuery("getNote", fetchInitialData,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      // refetchInterval: 5000,
    }
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell">
              <Editor />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}
