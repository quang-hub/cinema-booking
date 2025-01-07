// GlobalContext.js
import React, { createContext } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const sharedData = {
        domainName: ""
    }

    return (
        <GlobalContext.Provider value={{ sharedData }}>
            {children}
        </GlobalContext.Provider>
    );
};
