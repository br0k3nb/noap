import { createContext, ReactNode, useState, Dispatch, SetStateAction } from 'react';

type UserDataType = {
    _id: string;
    name: string;
    verified?: boolean;
    googleId?: string;
    TFAStatus?: string;
    googleAccount?: boolean;
    settings: {
      globalNoteBackgroundColor?: string;
      showPinnedNotesInFolder?: boolean;
      noteBackgroundColor?: string;
      noteTextExpanded?: boolean;
      language?: string;
      theme: string;
    }
};

type UserDataContextType = {
    userData: UserDataType;
    setUserData: Dispatch<SetStateAction<UserDataType>>;
};

type UserDataContextProps = {
    children: ReactNode;
}

const defaultValue = {
    userData: {
        _id: '',
        name: '',
        settings: {
            showPinnedNotesInFolder: false,
            noteTextExpanded: true,
        }
    } as UserDataType,
    setUserData: () => {}
};

export const UserDataCtx = createContext<UserDataContextType>(defaultValue);

export default function UserDataContext({ children }: UserDataContextProps) {
    const [userData, setUserData] = useState(defaultValue.userData);
    
    return (
        <UserDataCtx.Provider value={{ userData, setUserData }}>
            {children}
        </UserDataCtx.Provider>
    )
}
