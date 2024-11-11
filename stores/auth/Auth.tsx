import React, { createContext, useContext, ReactNode } from "react";
import { authStore } from "./authStore";

const AuthContext = createContext(authStore);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Missing AuthProvider");
  return context as NonNullable<typeof context>;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={authStore}>{children}</AuthContext.Provider>
  );
};
