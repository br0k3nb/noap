import { useContext } from "react"; 
import { LabelsCtx } from "../context/LabelCtx";

export default function useLabel() {
    return useContext(LabelsCtx);
}