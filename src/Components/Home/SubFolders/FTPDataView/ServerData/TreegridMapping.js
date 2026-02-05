import { create } from 'zustand';

export const TreegridMapping = create((set, get) => ({
  // Holds the current Full Path (e.g., "Desktop/IC007/Newfolder")
  activeFolderId: null,

  // --- NEW: CENTRALIZED DATA CACHE ---
  // Structure: { "Desktop/NewFolder": [ {nodeData...}, {nodeData...} ] }
  folderCache: {},

  // --- ACTIONS ---

  CurrentId:null,

  setCurrentId: () => get().activeFolderId,

  // 1. Set the Current Path
  setActiveFolderId: (id) => set({ activeFolderId: id }),

  // 2. Helper to get the current path
  getCurrentPath: () => get().activeFolderId,

  // 3. CACHE ACTION: Call this from ServerData.jsx after a successful API fetch
  cacheFolderData: (path, data) => set((state) => ({
    folderCache: {
      ...state.folderCache,
      [path]: data 
    }
  })),

  // 4. CLEAR CACHE (Optional: Call on Reset)
  clearCache: () => set({ folderCache: {} }),
}));