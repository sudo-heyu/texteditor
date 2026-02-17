"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import EditorToolbar from './EditorToolbar'

interface EditorProps {
    className?: string
}

const TiptapEditor = ({ className }: EditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '开始写作...',
            }),
        ],
        content: '<p>Hello World! 这是你的 AI 创意笔记本。</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-none',
            },
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className={cn("flex flex-col w-full h-full overflow-hidden bg-background", className)}>
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} className="flex-1 overflow-y-auto p-4 cursor-text" onClick={() => editor.commands.focus()} />
        </div>
    )
}

export default TiptapEditor
