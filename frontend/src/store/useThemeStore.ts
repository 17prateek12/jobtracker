import { create } from "zustand";

interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    isDarkMode: false,
    toggleTheme: () => {
        const nextDark = !get().isDarkMode;
        set({ isDarkMode: nextDark });
        if (nextDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    },
    initializeTheme: () => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
        set({ isDarkMode: shouldBeDark });
        if (shouldBeDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }
}));
