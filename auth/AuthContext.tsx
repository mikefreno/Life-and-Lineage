import React, { createContext, useContext, ReactNode } from "react";
import { authStore } from "./authStore";

const AuthContext = createContext(authStore);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={authStore}>{children}</AuthContext.Provider>
  );
};
