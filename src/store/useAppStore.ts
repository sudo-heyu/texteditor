import { create } from 'zustand'
import { type Editor } from '@tiptap/react'

export interface FileDocument {
    id: string
    title: string
    content: string
    lastModified: number
}

interface PendingEdit {
    originalHTML: string
    isApplying: boolean
}

interface EditHistoryItem {
    id: string
    timestamp: number
    previousContent: string
    newContent: string
    description?: string
}

interface AppState {
    isSidebarOpen: boolean
    viewMode: 'editor' | 'canvas' | 'split'
    activeFileId: string | null
    documents: FileDocument[]
    isAIPanelOpen: boolean
    aiMode: 'ask' | 'agent'
    aiError: string | null
    editorInstance: Editor | null
    pendingEdit: PendingEdit | null
    editHistory: EditHistoryItem[]
    toggleSidebar: () => void
    setViewMode: (mode: 'editor' | 'canvas' | 'split') => void
    setActiveFileId: (id: string | null) => void
    toggleAIPanel: () => void
    setAiMode: (mode: 'ask' | 'agent') => void
    setAiError: (error: string | null) => void
    setEditorInstance: (editor: Editor | null) => void
    startPendingEdit: (originalHTML: string) => void
    finishPendingEdit: () => void
    revertPendingEdit: () => void

    // Document Management
    addDocument: (doc: Omit<FileDocument, 'id' | 'lastModified'>) => void
    removeDocument: (id: string) => void
    updateDocument: (id: string, content: string) => void
    createNewFile: () => void

    // Edit History
    addEditHistory: (item: Omit<EditHistoryItem, 'id' | 'timestamp'>) => void
    undoLastEdit: () => boolean
    clearEditHistory: () => void
}

const STORAGE_KEY = 'ai-creative-notes-docs'

const loadDocuments = (): FileDocument[] => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch (e) {
            console.error('Failed to load documents', e)
        }
    }
    return [
        {
            id: 'default-1',
            title: 'Project PRD.md',
            content: '<h1>项目需求文档</h1><p>这里是默认内容...</p>',
            lastModified: Date.now()
        }
    ]
}

const saveDocuments = (docs: FileDocument[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

export const useAppStore = create<AppState>((set, get) => ({
    isSidebarOpen: true,
    viewMode: 'split',
    activeFileId: 'default-1',
    documents: loadDocuments(),
    isAIPanelOpen: false,
    aiMode: 'ask',
    aiError: null,
    editorInstance: null,
    pendingEdit: null,
    editHistory: [],
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setViewMode: (mode) => set({ viewMode: mode }),
    setActiveFileId: (id) => set({ activeFileId: id }),
    toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
    setAiMode: (mode) => set({ aiMode: mode }),
    setAiError: (error) => set({ aiError: error }),
    setEditorInstance: (editor) => set({ editorInstance: editor }),
    startPendingEdit: (originalHTML) => set({
        pendingEdit: { originalHTML, isApplying: true }
    }),
    finishPendingEdit: () => set({ pendingEdit: null }),
    revertPendingEdit: () => set((state) => {
        if (state.editorInstance && state.pendingEdit) {
            state.editorInstance.commands.setContent(state.pendingEdit.originalHTML)
        }
        return { pendingEdit: null }
    }),

    addDocument: (doc) => set((state) => {
        const newDoc: FileDocument = {
            ...doc,
            id: Math.random().toString(36).substring(7),
            lastModified: Date.now()
        }
        const newDocs = [...state.documents, newDoc]
        saveDocuments(newDocs)
        return { documents: newDocs, activeFileId: newDoc.id }
    }),

    removeDocument: (id) => set((state) => {
        const newDocs = state.documents.filter(d => d.id !== id)
        saveDocuments(newDocs)
        return {
            documents: newDocs,
            activeFileId: state.activeFileId === id ? (newDocs[0]?.id || null) : state.activeFileId
        }
    }),

    updateDocument: (id, content) => set((state) => {
        const newDocs = state.documents.map(d =>
            d.id === id ? { ...d, content, lastModified: Date.now() } : d
        )
        saveDocuments(newDocs)
        return { documents: newDocs }
    }),

    createNewFile: () => {
        const { addDocument } = get()
        addDocument({
            title: '新建文档',
            content: ''
        })
    },

    // Edit History
    addEditHistory: ({ previousContent, newContent, description }) => set((state) => {
        const newItem: EditHistoryItem = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            previousContent,
            newContent,
            description
        }
        return { editHistory: [...state.editHistory, newItem].slice(-10) } // Keep last 10 items
    }),

    undoLastEdit: () => {
        const state = get()
        const editorInstance = state.editorInstance
        const editHistory = state.editHistory

        if (!editorInstance || editHistory.length === 0) return false

        const lastEdit = editHistory[editHistory.length - 1]

        // Restore previous content
        editorInstance.commands.setContent(lastEdit.previousContent)

        // Update document in store if active file exists
        if (state.activeFileId) {
            const newDocs = state.documents.map(d =>
                d.id === state.activeFileId ? { ...d, content: lastEdit.previousContent, lastModified: Date.now() } : d
            )
            saveDocuments(newDocs)

            set({
                documents: newDocs,
                editHistory: editHistory.slice(0, -1) // Remove the undone edit
            })
        } else {
            set({ editHistory: editHistory.slice(0, -1) })
        }

        return true
    },

    clearEditHistory: () => set({ editHistory: [] })
}))
