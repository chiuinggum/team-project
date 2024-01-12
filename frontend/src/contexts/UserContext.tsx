import React, { createContext, useState, useContext, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";

type UserData = {
  id: number;
  role_id: number;
  provider: string;
  email: string;
  password: string;
  name: string;
  picture: string;
};

type UserContextType = {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useUser = () => useContext(UserContext);

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);

  const login = (userData: UserData) => {
    setUser(userData);
  };

  const logout = async () => {
    console.log(window.localStorage.getItem('token')) ;
    fetch('http://localhost:3000/api/1.0/user/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setUser(null);
    const storage = window.localStorage;
    storage.removeItem("token");
    storage.removeItem("cart");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
