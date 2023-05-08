import { useRef, useEffect, useState, useContext } from "react";
import { FieldArrayWithId, useForm } from "react-hook-form";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";

import { pack, unpack } from "msgpackr";
import { BSON } from 'bson';

import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";

import { toastAlert } from "../../../../components/Alert/Alert";
import { NoteWasChangedCtx } from "../../../../context/NoteWasChangedCtx";
import { NoteCtx } from "../../../../context/SelectedNoteCtx";
import { ExpandedCtx } from "../../../../context/NoteExpandedCtx";

import api from "../../../../services/api";

import Editor from "./Editor";

type Notes = {
  note: {
    _id: string;
    userId: string;
    title?: string;
    body: string;
    image?: string;
    state: {
      _id: string;
      state: string;
    };
    labels?: {
      _id: string;
      name: string;
      type: string;
      color: string;
      fontColor: string;
    };
    updatedAt?: string;
    createdAt: string;
  }[];
};

type Props = {
  notes: FieldArrayWithId<Notes, "note", "id">[];
};

export default function App({ notes }: Props): JSX.Element {
  const editorRef = useRef<any>(null);
  const lastExpanded = useRef<boolean | undefined>(false);
  const lastSelectedNotes = useRef<number | null | undefined>(null);

  const [ saveSpinner, setSaveSpinner ] = useState(false);
  const [ floatingAnchorElem, setFloatingAnchorElem ] = useState<HTMLDivElement | null>(null);

  const noteWasChangedContext = useContext(NoteWasChangedCtx);
  const noteContext = useContext(NoteCtx);
  const noteExpanded = useContext(ExpandedCtx);

  useEffect(() => {
    lastSelectedNotes.current = noteContext?.selectedNote;
    setTimeout(() => setFloatingAnchorElem(editorRef.current));
  }, [noteContext?.selectedNote]);

  useEffect(() => {
    lastExpanded.current = noteExpanded?.expanded;
  }, [noteExpanded?.expanded]);

  const { reset, register } = useForm({});

  const parsedUserToken = JSON.parse(
    window.localStorage.getItem("user_token") || ""
    );
    
    const saveNote = async (currentState: any) => {
      setSaveSpinner(true);

      let images = ''

      const title = editorRef?.current.firstChild.children[0].childNodes[0].children[0].value;
      const body = editorRef?.current.firstChild.children[1].innerHTML;

      const findImages = body.match(/<img[^>]+>/gm);
      const getTextBettwenSpanTags = body.match(/(?<=(<span data-lexical-text="true">))(\w|\d|\n|[().,\-:;@#$%^&*\[\]"'+–/\/®°⁰!?{}|`~]| )+?(?=(<\/span>))/gm);

      if(findImages && findImages.length !== 0) {
        const removeInlineStyleFormImage = findImages[0].replace(/style="[^"]+"/gm, '');
        images = removeInlineStyleFormImage.replace(/>/, ' className="rounded-b-lg object-cover !h-[3.50rem] w-[162px] xxs:w-[159px]">');
      }
      else images = 'no image attached';
      
      try {
        if (currentState) {
          const state = JSON.stringify(currentState);
          
          const compressState = pack({state});
          const resultState = unpack(compressState);

          const compressImg = BSON.serialize({images});
          const resultImg = BSON.deserialize(compressImg)

          const create = await api.patch(
            `https://noap-typescript-api.vercel.app/edit/${parsedUserToken.token}`,
            {
              title,
              body: getTextBettwenSpanTags ? getTextBettwenSpanTags.slice(0,25).join(' ').slice(0,136) : '',
              image: resultImg.images,
              state: resultState.state,
              _id: notes[(noteContext?.selectedNote as number)]._id,
              stateId: notes[(noteContext?.selectedNote as number)].state._id
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
    const [ editor ] = useLexicalComposerContext();

    if(lastSelectedNotes.current !== noteContext?.selectedNote || noteExpanded?.expanded !== lastExpanded.current) {
      setTimeout(() => {
        reset({
          title: notes[noteContext?.selectedNote as number].title,
        });

        const editorState = editor.parseEditorState((notes[noteContext?.selectedNote as number].state.state));
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
            <div className="editor-shell h-screen w-fit overflow-hidden absolute ">
              {/* @ts-ignore */}
              <UpdatePlugin />
              <Editor
                note={notes[noteContext?.selectedNote as number]}
                ref={editorRef}
                save={saveNote}
                register={register}
                saveSpinner={saveSpinner}
                floatingAnchorElem={floatingAnchorElem}
              />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}