import { create } from "zustand";

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    picture?: string;
}

interface AuthState {
    token: string | null;
    user: UserProfile | null;
    login: (token: string, user: UserProfile) => void;
    logout: () => void;
    initializeAuth: () => void;
}

const getInitialToken = () => localStorage.getItem("token");
const getInitialUser = (): UserProfile | null => {
    try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    token: getInitialToken(),
    user: getInitialUser(),
    login: (token, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
    },
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
    },
    initializeAuth: () => {
        set({
            token: getInitialToken(),
            user: getInitialUser(),
        });
    }
}));
