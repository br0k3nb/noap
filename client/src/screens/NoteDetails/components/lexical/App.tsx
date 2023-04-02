import { useRef, useEffect, useState, useContext, Dispatch, SetStateAction } from "react";
import { FieldArrayWithId, useForm } from "react-hook-form";
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
    image?: string;
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
  const lastSelectedNotes = useRef<number | undefined>(undefined);

  const [ saveSpinner, setSaveSpinner ] = useState(false);

  const noteWasChangedContext = useContext<NoteWasChangedContext | null>(NoteWasChanged);
  const noteContext = useContext(NoteContext);

  useEffect(() => {
    lastSelectedNotes.current = noteContext?.selectedNote;
  }, [noteContext?.selectedNote]);

  const { reset, register } = useForm({});

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
  );

  const saveNote = async (currentState: any) => {
    setSaveSpinner(true);
    
    const title = editorRef?.current.firstChild.firstChild?.value;
    const body = editorRef?.current.lastElementChild.innerHTML;
    
    const removeClasses = body.replace(/class="[^"]+"/gm, '');
    const removeLowerCaseContentEditable = removeClasses.replace(/contenteditable="[^"]+"/gm, '');
    const removeCamelCaseContentEditable = removeLowerCaseContentEditable.replace(/contentEditable="[^"]+"/gm, '');
    const findImages = removeCamelCaseContentEditable.match(/<img[^>]+>/gm);
    const removeImages = findImages && removeCamelCaseContentEditable.replace(/<img[^>]+>/gm, '');
    
    const finalHTMLString =
    removeImages ? removeImages.replace(/<[^/>][^>]*><\/[^>]+>/gm, '') 
    : removeCamelCaseContentEditable.replace(/<[^/>][^>]*><\/[^>]+>/gm, '');
    
    const getImage = () => {
      if(findImages && findImages.length !== 0) {
        const removeInlineStyleFormImage = findImages[0].replace(/style="[^"]+"/gm, '');
        return removeInlineStyleFormImage.replace(/>/, ' className="rounded-b-lg object-cover !h-[55.5px] w-[163px] xxs:w-[159px]">');
      }
      else return 'no image attached';
    }
    
    try {
      if (currentState) {
        const create = await api.patch(
          `https://noap-typescript-api.vercel.app/edit/${parsedUserToken.token}`,
          {
            title,
            body: finalHTMLString,
            image: getImage(),
            state: JSON.stringify(currentState),
            _id: notes[(noteContext?.selectedNote as number)]._id 
          }
        );
        
        noteWasChangedContext?.setWasChanged(!noteWasChangedContext.wasChanged);
        setSaveSpinner(false);
        
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
    
    if(lastSelectedNotes.current !== noteContext?.selectedNote) {
      setTimeout(() => {
        reset({
          title: notes[noteContext?.selectedNote as number].title,
        });

        const editorState = editor.parseEditorState(JSON.parse(notes[noteContext?.selectedNote as number].state));
        editor.setEditorState(editorState);
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);  
      }, 0); 
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="editor-shell">
              {/* @ts-ignore */}
              <UpdatePlugin/>
              <Editor
                ref={editorRef}
                save={saveNote}
                register={register}
                saveSpinner={saveSpinner}
              />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}