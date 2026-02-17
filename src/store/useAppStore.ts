import { create } from 'zustand'

interface AppState {
    isSidebarOpen: boolean
    viewMode: 'editor' | 'canvas' | 'split'
    toggleSidebar: () => void
    setViewMode: (mode: 'editor' | 'canvas' | 'split') => void
}

export const useAppStore = create<AppState>((set) => ({
    isSidebarOpen: true,
    viewMode: 'split',
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setViewMode: (mode) => set({ viewMode: mode }),
}))
