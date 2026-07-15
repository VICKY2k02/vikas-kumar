import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {

    user: any;

    login: (user: any, token: string) => void;

    logout: () => void;

}

export const AuthContext =
    createContext<AuthContextType>(null!);

export const AuthProvider = ({
    children
}: {
    children: ReactNode
}) => {

    const [user, setUser] = useState(
        JSON.parse(
            localStorage.getItem("user") || "null"
        )
    );

    const login = (user: any, token: string) => {
    console.log("LOGIN USER:", user);

    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
};

    const logout = () => {

        localStorage.clear();

        setUser(null);

    }

    return (

        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    )

}