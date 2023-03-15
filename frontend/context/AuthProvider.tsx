import {createContext, ReactNode, useState} from "react";

const AuthContext = createContext({
    auth: false,
    loginUser: () => {},
    logoutUser: () => {}
});

export default AuthContext;

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [auth, setAuth] = useState<boolean>(false);

    let loginUser = async () => {
        setAuth(true);
    }

    let logoutUser = async () => {
        setAuth(false);
    }


    let contextData = {
        auth: auth,
        loginUser: loginUser,
        logoutUser: logoutUser,
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};