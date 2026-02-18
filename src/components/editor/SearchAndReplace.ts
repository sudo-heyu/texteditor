import { Extension } from '@tiptap/core'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface SearchAndReplaceOptions {
    searchTerm: string
    replaceTerm: string
    searchResultClass: string
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        searchAndReplace: {
            setSearchTerm: (searchTerm: string) => ReturnType
            setReplaceTerm: (replaceTerm: string) => ReturnType
            replace: () => ReturnType
            replaceAll: () => ReturnType
        }
    }
}

export const SearchAndReplace = Extension.create<SearchAndReplaceOptions>({
    name: 'searchAndReplace',

    addOptions() {
        return {
            searchTerm: '',
            replaceTerm: '',
            searchResultClass: 'search-result',
        }
    },

    addStorage() {
        return {
            results: [],
        }
    },

    addCommands() {
        return {
            setSearchTerm: (searchTerm: string) => ({ editor, view, dispatch }) => {
                this.options.searchTerm = searchTerm
                return true
            },
            setReplaceTerm: (replaceTerm: string) => ({ editor, view, dispatch }) => {
                this.options.replaceTerm = replaceTerm
                return true
            },
            replace: () => ({ editor, view, dispatch }) => {
                const { searchTerm, replaceTerm } = this.options
                if (!searchTerm) return false

                const { state } = view
                const { doc } = state
                let found = false

                doc.descendants((node, pos) => {
                    if (found) return false
                    if (node.isText) {
                        const index = node.text?.indexOf(searchTerm) ?? -1
                        if (index !== -1) {
                            const transaction = state.tr.insertText(replaceTerm, pos + index, pos + index + searchTerm.length)
                            dispatch?.(transaction)
                            found = true
                        }
                    }
                })
                return found
            },
            replaceAll: () => ({ editor, view, dispatch }) => {
                const { searchTerm, replaceTerm } = this.options
                if (!searchTerm) return false

                const { state } = view
                let tr = state.tr
                let offset = 0

                state.doc.descendants((node, pos) => {
                    if (node.isText) {
                        const text = node.text ?? ''
                        let index = text.indexOf(searchTerm)
                        while (index !== -1) {
                            tr.insertText(replaceTerm, pos + index + offset, pos + index + searchTerm.length + offset)
                            offset += replaceTerm.length - searchTerm.length
                            index = text.indexOf(searchTerm, index + searchTerm.length)
                        }
                    }
                })

                dispatch?.(tr)
                return true
            },
        }
    },

    addProseMirrorPlugins() {
        const extension = this

        return [
            new Plugin({
                key: new PluginKey('searchAndReplace'),
                state: {
                    init() {
                        return DecorationSet.empty
                    },
                    apply(tr, oldState) {
                        const searchTerm = extension.options.searchTerm
                        if (!searchTerm) return DecorationSet.empty

                        const doc = tr.doc
                        const decorations: Decoration[] = []

                        doc.descendants((node, pos) => {
                            if (node.isText) {
                                const text = node.text ?? ''
                                let index = text.indexOf(searchTerm)
                                while (index !== -1) {
                                    decorations.push(
                                        Decoration.inline(pos + index, pos + index + searchTerm.length, {
                                            class: extension.options.searchResultClass,
                                        })
                                    )
                                    index = text.indexOf(searchTerm, index + searchTerm.length)
                                }
                            }
                        })

                        extension.storage.results = decorations
                        return DecorationSet.create(doc, decorations)
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    },
                },
            }),
        ]
    },
})
