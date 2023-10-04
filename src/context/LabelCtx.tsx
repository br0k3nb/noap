import { createContext, Dispatch, ReactNode } from 'react';
import { UseFieldArrayRemove } from "react-hook-form";
import type { labelsActions } from '../reducers/labelReducer';

interface LabelContext {
    pageLabel: number;
    searchLabel: string;
    isFetching?: boolean;
    hasNextPageLabel: boolean;
    fetchLabels?: () => Promise<void>;
    removeLabels?: UseFieldArrayRemove;
    dispatchLabels: Dispatch<labelsActions>;
}

interface LabelContextProps extends LabelContext {
    children: ReactNode,
}

const defaultValue = {
    pageLabel: 0,
    searchLabel: '',
    hasNextPageLabel: false,
    dispatchLabels: () => {},
};

export const LabelsCtx = createContext<LabelContext>(defaultValue);

export default function LabelsContext({ 
    children,
    pageLabel,
    isFetching, 
    fetchLabels, 
    searchLabel,
    removeLabels,
    dispatchLabels,
    hasNextPageLabel
}: LabelContextProps) {
    return (
        <LabelsCtx.Provider 
            value={{
                pageLabel,
                isFetching,
                searchLabel,
                fetchLabels,
                removeLabels, 
                dispatchLabels,
                hasNextPageLabel
            }}
        >
            {children}
        </LabelsCtx.Provider>
    )
}