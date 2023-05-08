import { createContext } from 'react';
import { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";

type Labels = {
    labels: {
        _id: string;
        userId: string;
        name: string;
        color: string;
        fontColor?: string;
        type: string;
        updatedAt?: string;
        createdAt: string;
    }[];
};
  
type LabelContext = {
    isFetching: boolean;
    fetchLabels: () => Promise<void>;
    removeLabels: UseFieldArrayRemove; 
    labels: FieldArrayWithId<Labels, "labels", "id">[];
  }

type Props = {
    children: any,
    isFetching: boolean;
    fetchLabels: () => Promise<void>;
    removeLabels: UseFieldArrayRemove; 
    labels: FieldArrayWithId<Labels, "labels", "id">[];
}

export const LabelsCtx = createContext<LabelContext | null>(null);

export default function LabelsContext({ children, isFetching, fetchLabels, removeLabels, labels }: Props) {

    return (
        <LabelsCtx.Provider value={{ isFetching, fetchLabels, removeLabels, labels }}>
            {children}
        </LabelsCtx.Provider>
    )
}