import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import "./ContentEditable.css";

type LexicalContentEditableProps = {
  className?: string;
};

export default function LexicalContentEditable({ className }: LexicalContentEditableProps) {
  return (
    <ContentEditable 
      id="ContentEditable__root" 
      className={className || "ContentEditable__root"} 
      spellCheck="false" 
    />
  );
}