import { createContext, Dispatch, SetStateAction } from 'react';

type UserDataType = {
    _id: string;
    name: string;
    verified?: boolean;
    googleId?: string;
    TFAStatus?: string;
    googleAccount?: boolean;
    settings?: {
        showPinnedNotesInFolder?: boolean;
        noteBackgroundColor?: string;
        noteTextExpanded: boolean;
        language?: string;
        theme?: string;
    }
};

type UserDataContextType = {
    userData: UserDataType;
    setUserData: Dispatch<SetStateAction<UserDataType>>;
};

type Props = {
    children: any,
    userData: UserDataType;
    setUserData: Dispatch<SetStateAction<UserDataType>>;
}

export const UserDataCtx = createContext<UserDataContextType | null>(null);

export default function UserDataContext({ children, userData, setUserData }: Props) {
    return (
        <UserDataCtx.Provider value={{ userData, setUserData }}>
            {children}
        </UserDataCtx.Provider>
    )
}
