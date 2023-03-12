import { createContext, useState, ReactNode } from "react";

interface AuthContextProps {
  auth: any;
  setAuth: any;
}

export const AuthContext = createContext<AuthContextProps>({
  auth: null,
  setAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState({});

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};