import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import "./ContentEditable.css";

export default function LexicalContentEditable({ className }) {
  return <ContentEditable className={className || "ContentEditable__root"} />;
}