"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  role: string;
  token: string;
}

interface AuthCtx {
  user: User | null;
  login: (token: string, email: string, role: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isFarmer: boolean;
  isBuyer: boolean;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
    setLoaded(true);
  }, []);

  const login = (token: string, email: string, role: string) => {
    const u = { token, email, role };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!loaded) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "Admin",
        isFarmer: user?.role === "Farmer",
        isBuyer: user?.role === "Buyer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
