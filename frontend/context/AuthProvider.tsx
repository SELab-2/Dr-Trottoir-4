import { createContext, ReactNode, useEffect, useState } from "react";

const AuthContext = createContext({
  auth: false,
  loginUser: () => {},
  logoutUser: () => {},
});

export default AuthContext;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<boolean>(false);

  let loginUser = async () => {
    setAuth(true);
  };

  let logoutUser = async () => {
    setAuth(false);
    sessionStorage.removeItem("auth");
  };

  useEffect(() => {
    const data = sessionStorage.getItem("auth");
    if (data) {
      setAuth(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  let contextData = {
    auth: auth,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
