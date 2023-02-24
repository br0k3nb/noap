import {useState, createContext} from "react";

export const userContext = createContext({data: ''});

export const UserProvider = ({children}) => {
    const [providerIvalue, setProviderIvalue] = useState('Valor inicial');
    return (
    <userContext.Provider value={{
        providerIvalue, setProviderIvalue
    }}>
        {children}
    </userContext.Provider>);
}