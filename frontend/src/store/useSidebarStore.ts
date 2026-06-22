import { create } from "zustand";

interface SidebarState {
    isCollapsed: boolean;
    isOpenMobile: boolean;
    toggleSidebar: () => void;
    closeMobile: () => void;
    openMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
    isCollapsed: false,
    isOpenMobile: false,
    toggleSidebar: () => {
        if (window.innerWidth <= 768) {
            set({ isOpenMobile: !get().isOpenMobile });
        } else {
            set({ isCollapsed: !get().isCollapsed });
        }
    },
    closeMobile: () => {
        set({ isOpenMobile: false });
    },
    openMobile: () => {
        set({ isOpenMobile: true });
    }
}));
