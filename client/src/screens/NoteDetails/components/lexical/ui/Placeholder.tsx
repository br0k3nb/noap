import { ReactNode, useContext } from "react";

import { NoteSettingsCtx } from "../../../../../context/NoteSettingsCtx";

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
  const editorDiv = customRef.current && customRef.current.getBoundingClientRect();

  return (
    <div 
      className={className ||  `Placeholder__root text-gray-400 `} 
      style={!expanded ? { 
          left: editorDiv?.x && editorDiv?.x - 410
        } : { 
          left: editorDiv?.x && editorDiv?.x + 30
        }
      }
    >
      {children}
    </div>
  );
}
