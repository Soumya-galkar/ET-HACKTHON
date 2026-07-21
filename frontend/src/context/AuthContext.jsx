import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("ikip_user") || "null"); } catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("ikip_token");
        if (!token) { setLoading(false); return; }
        api.get("/auth/me").then((r) => {
            setUser(r.data);
            localStorage.setItem("ikip_user", JSON.stringify(r.data));
        }).catch(() => {
            localStorage.removeItem("ikip_token");
            localStorage.removeItem("ikip_user");
            setUser(null);
        }).finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("ikip_token", data.token);
        localStorage.setItem("ikip_user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };
    const signup = async (name, email, password) => {
        const { data } = await api.post("/auth/signup", { name, email, password });
        localStorage.setItem("ikip_token", data.token);
        localStorage.setItem("ikip_user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };
    const logout = () => {
        localStorage.removeItem("ikip_token");
        localStorage.removeItem("ikip_user");
        setUser(null);
    };

    return <AuthCtx.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
