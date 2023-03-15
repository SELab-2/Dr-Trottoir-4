import {createContext, useState, ReactNode} from "react";

const AuthContext = createContext({
    auth : false,
    loginUser: () => {},
    logoutUser: () => {}
});

export default AuthContext;

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [auth, setAuth] = useState<boolean>(false);

    let loginUser = async () => {
        console.log("USER IS LOGGED IN");
        setAuth(true);
    }

    let logoutUser = async () => {
        console.log("USER IS LOGGED OUT");
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