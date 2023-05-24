import { createContext, Dispatch, SetStateAction } from 'react';
import { UseFieldArrayRemove } from "react-hook-form";
  
type LabelContext = {
    pageLabel: number;
    searchLabel: string;
    isFetching?: boolean;
    hasNextPageLabel: boolean;
    fetchLabels?: () => Promise<void>;
    removeLabels?: UseFieldArrayRemove;
    setPageLabel: Dispatch<SetStateAction<number>>;
    setSearchLabel: Dispatch<SetStateAction<string>>;
  }

type Props = {
    children: any,
    pageLabel: number;
    isFetching?: boolean;
    searchLabel: string;
    hasNextPageLabel: boolean;
    fetchLabels?: () => Promise<void>;
    removeLabels?: UseFieldArrayRemove;
    setPageLabel: Dispatch<SetStateAction<number>>;
    setSearchLabel: Dispatch<SetStateAction<string>>;
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
        hasNextPageLabel
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
                hasNextPageLabel
            }}
        >
            {children}
        </LabelsCtx.Provider>
    )
}