import { useState } from "react";
import { OpenInFull, MoreHoriz } from "@mui/icons-material";

import Editor from './lexical/App.jsx';

type Props = {};

export default function TextEditor({}: Props) {

  return (
    <div className="flex flex-col ">
      <Editor/>
    </div>
  );
}
