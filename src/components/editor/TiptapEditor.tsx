"use client"

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { useAppStore } from '@/store/useAppStore'
import StarterKit from '@tiptap/starter-kit'
import { Extension } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { FontFamily } from '@tiptap/extension-font-family'
import { Superscript } from '@tiptap/extension-superscript'
import { Subscript } from '@tiptap/extension-subscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Link } from '@tiptap/extension-link'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { createLowlight, all } from 'lowlight'

import EditorToolbar from './EditorToolbar'
import { SelectionBubbleMenu } from './SelectionBubbleMenu'
import { TableBubbleMenu } from './TableBubbleMenu'
import { TableEdgeControls } from './TableEdgeControls'
import { SlashCommand } from './SlashCommand'
import { suggestion } from './suggestion'
import { FindReplace } from './FindReplace'
import { DocumentOutline } from './DocumentOutline'
import { SearchAndReplace } from './SearchAndReplace'
import { DiffActionToolbar } from './DiffActionToolbar'
import {
    LayoutList,
    Search as SearchIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const lowlight = createLowlight(all)

const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run()
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run()
            },
        }
    },
}) as any

const ListKeymap = Extension.create({
    name: 'listKeymap',
    addKeyboardShortcuts() {
        return {
            Backspace: () => {
                const { state } = this.editor
                const { selection } = state
                const { $from, empty } = selection

                // Only handle if it's a paragraph inside a list item
                if (!empty || $from.parent.type.name !== 'paragraph') {
                    return false
                }

                const isAtStart = $from.parentOffset === 0
                const isInListItem = this.editor.isActive('listItem')

                // If at start of empty list item, lift it and keep focus
                if (isAtStart && isInListItem && $from.parent.content.size === 0) {
                    return this.editor.chain()
                        .liftListItem('listItem')
                        .focus()
                        .run()
                }

                return false
            },
        }
    },
})


interface EditorProps {
    className?: string
}

export default function TiptapEditor({ className }: EditorProps) {
    const [isSearchOpen, setIsSearchOpen] = React.useState(false)
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                horizontalRule: false,
            }),
            Placeholder.configure({
                placeholder: '开始记录您的创作灵感...',
            }),
            TextStyle,
            Color,
            FontFamily,
            FontSize,
            Highlight.configure({ multicolor: true }),
            Underline,
            Superscript,
            Subscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4 border-2 border-transparent hover:border-primary/50 transition-all cursor-pointer',
                },
            }),
            Table.configure({
                resizable: true,
                lastColumnResizable: false,
                allowTableNodeSelection: true,
                handleWidth: 5,
                cellMinWidth: 25,
            }),
            TableRow,
            TableHeader.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        backgroundColor: {
                            default: null,
                            parseHTML: element => element.style.backgroundColor || null,
                            renderHTML: attributes => {
                                if (!attributes.backgroundColor) return {}
                                return { style: `background-color: ${attributes.backgroundColor}; --cell-bg: ${attributes.backgroundColor}` }
                            }
                        }
                    }
                }
            }),
            TableCell.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        backgroundColor: {
                            default: null,
                            parseHTML: element => element.style.backgroundColor || null,
                            renderHTML: attributes => {
                                if (!attributes.backgroundColor) return {}
                                return { style: `background-color: ${attributes.backgroundColor}; --cell-bg: ${attributes.backgroundColor}` }
                            }
                        }
                    }
                }
            }),
            HorizontalRule.configure({
                HTMLAttributes: {
                    class: 'my-8 border-t border-muted',
                },
            }),
            SearchAndReplace.configure({
                searchResultClass: 'search-result',
            }),
            SlashCommand.configure({
                suggestion,
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'rounded-md bg-muted p-4 font-mono text-sm my-4',
                },
            }),
            ListKeymap,
        ],
        content: `
            <h1>欢迎使用超级编辑器</h1>
            <p>这是一个对标专业办公软件的编辑器。你可以体验：</p>
            <ul>
                <li><strong>可视化表格：</strong> 支持自由调整大小、合并/拆分单元格。</li>
                <li><strong>现代化交互：</strong> 选中文本弹出气泡菜单，输入 / 唤起命令面板。</li>
                <li><strong>专业排版：</strong> 丰富的字体库、精细的字号控制。</li>
                <li><strong>强大工具：</strong> 全局查找替换、文档结构大纲。</li>
            </ul>
        `,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[500px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            const { activeFileId, updateDocument } = useAppStore.getState()
            if (activeFileId) {
                updateDocument(activeFileId, editor.getHTML())
            }
        },
    })

    const { activeFileId, documents, setEditorInstance } = useAppStore()
    const activeDoc = documents.find((d: any) => d.id === activeFileId)

    // Sync editor content with active document
    React.useEffect(() => {
        if (editor && activeDoc && editor.getHTML() !== activeDoc.content) {
            console.log('TiptapEditor useEffect: Syncing editor with activeDoc, content differs')
            console.log('Editor content length:', editor.getHTML().length)
            console.log('ActiveDoc content length:', activeDoc.content.length)
            editor.commands.setContent(activeDoc.content)
        }
    }, [activeFileId, editor]) // Only run when activeFileId changes or editor is ready

    React.useEffect(() => {
        if (editor) {
            setEditorInstance(editor)
        }
        return () => {
            setEditorInstance(null)
        }
    }, [editor, setEditorInstance])

    return (
        <div className={cn("flex flex-col h-full relative", className)}>
            <EditorToolbar editor={editor} />
            <div className="flex-1 overflow-y-auto cursor-text bg-background">
                <SelectionBubbleMenu editor={editor} />
                <TableBubbleMenu editor={editor} />
                <TableEdgeControls editor={editor} />
                <DiffActionToolbar />
                <EditorContent editor={editor} />

                {/* Floating Find/Replace Panel */}
                {isSearchOpen && (
                    <FindReplace editor={editor} onClose={() => setIsSearchOpen(false)} />
                )}

                {/* Floating Tools (Bottom Right) */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-40">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full shadow-lg border-2 border-primary/20 hover:border-primary/50 transition-all bg-background/80 backdrop-blur"
                                title="文档大纲"
                            >
                                <LayoutList className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="left" className="w-64 p-0 mr-2" align="end">
                            <DocumentOutline editor={editor} />
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="secondary"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full shadow-lg border-2 border-primary/20 hover:border-primary/50 transition-all bg-background/80 backdrop-blur",
                            isSearchOpen && "bg-primary text-primary-foreground border-primary"
                        )}
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        title="查找和替换"
                    >
                        <SearchIcon className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
