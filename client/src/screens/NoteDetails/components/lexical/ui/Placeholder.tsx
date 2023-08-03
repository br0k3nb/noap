import { ReactNode, useContext } from "react";

import { NoteSettingsCtx } from "../../../../../context/NoteSettingsCtx";
import { UserDataCtx } from "../../../../../context/UserDataContext";

import "./Placeholder.css";

type Props = {
  children: ReactNode;
  className?: string;
  customRef?: any;
};

export default function Placeholder({
  children,
  className,
  customRef
}: Props): JSX.Element {
  const { noteSettings: { expanded } } = useContext(NoteSettingsCtx) as any;
  const { userData: { settings: { noteTextExpanded } } } = useContext(UserDataCtx) as any;

  const editorDiv = customRef.current && customRef.current.getBoundingClientRect();
  const verifyEditorDivRef = editorDiv?.x !== undefined && typeof editorDiv?.x === "number";

  return (
    <div 
      className={className ||  `Placeholder__root text-gray-400 `} 
      style={(!expanded && verifyEditorDivRef) ? { 
          left: (verifyEditorDivRef && noteTextExpanded) && editorDiv?.x - 410
        } : { 
          left: verifyEditorDivRef && editorDiv?.x + 30
        }
      }
    >
      {children}
    </div>
  );
}
