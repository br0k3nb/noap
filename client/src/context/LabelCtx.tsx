import { createContext, Dispatch, SetStateAction } from 'react';
import { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";
  
type LabelContext = {
    pageLabel: number;
    searchLabel: string;
    isFetching: boolean;
    hasNextPageLabel: boolean;
    fetchLabels: () => Promise<void>;
    removeLabels: UseFieldArrayRemove;
    setPageLabel: Dispatch<SetStateAction<number>>;
    setSearchLabel: Dispatch<SetStateAction<string>>;
    setTotalDocsLabel: Dispatch<SetStateAction<number>>;
    setHasNextPageLabel: Dispatch<SetStateAction<boolean>>;
  }

type Props = {
    children: any,
    pageLabel: number;
    isFetching: boolean;
    searchLabel: string;
    hasNextPageLabel: boolean;
    fetchLabels: () => Promise<void>;
    removeLabels: UseFieldArrayRemove;
    setPageLabel: Dispatch<SetStateAction<number>>;
    setSearchLabel: Dispatch<SetStateAction<string>>;
    setTotalDocsLabel: Dispatch<SetStateAction<number>>;
    setHasNextPageLabel: Dispatch<SetStateAction<boolean>>;
}

export const LabelsCtx = createContext<LabelContext | null>(null);

export default function LabelsContext({ 
        children,
        pageLabel,
        isFetching, 
        fetchLabels, 
        searchLabel,
        removeLabels,
        setPageLabel, 
        setSearchLabel,
        hasNextPageLabel,
        setTotalDocsLabel, 
        setHasNextPageLabel 
    }: Props) {

    return (
        <LabelsCtx.Provider 
            value={{
                pageLabel,
                isFetching,
                searchLabel,
                fetchLabels,
                removeLabels, 
                setPageLabel,
                setSearchLabel,
                hasNextPageLabel,
                setTotalDocsLabel,
                setHasNextPageLabel
            }}
        >
            {children}
        </LabelsCtx.Provider>
    )
}