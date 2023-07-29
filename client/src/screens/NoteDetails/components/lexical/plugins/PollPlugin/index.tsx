import { useEffect, useState } from "react";

import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  LexicalEditor,
} from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";

import { $createPollNode, createPollOption, PollNode } from "../../nodes/PollNode";
import Button from "../../ui/Button";
import { DialogActions } from "../../ui/Dialog";
import TextInput from "../../ui/TextInput";

export const INSERT_POLL_COMMAND: LexicalCommand<string> = createCommand("INSERT_POLL_COMMAND");

export function InsertPollDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [question, setQuestion] = useState("");

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_POLL_COMMAND, question);
    onClose();
  };

  return (
    <>
      <TextInput label="Question" onChange={setQuestion} value={question} />
      <DialogActions>
        <Button disabled={question.trim() === ""} onClick={onClick}>
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export default function PollPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([PollNode])) {
      throw new Error("PollPlugin: PollNode not registered on editor");
    }

    return editor.registerCommand<string>(
      INSERT_POLL_COMMAND,
      (payload) => {
        const pollNode = $createPollNode(payload, [ createPollOption(), createPollOption() ]);
        $insertNodes([pollNode]);

        if ($isRootOrShadowRoot(pollNode.getParentOrThrow())) {
          $wrapNodeInElement(pollNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  return null;
}
