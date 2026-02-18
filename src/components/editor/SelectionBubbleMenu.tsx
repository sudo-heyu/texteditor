"use client"

import { BubbleMenu } from '@tiptap/react/menus'
import { type Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LinkPopover } from './LinkPopover'

interface SelectionBubbleMenuProps {
    editor: Editor | null
}

export const SelectionBubbleMenu = ({ editor }: SelectionBubbleMenuProps) => {
    if (!editor) return null

    return (
        <BubbleMenu
            editor={editor}
            shouldShow={({ editor }) => {
                // Don't show if inside a table or if it's a cell selection
                const isTableActive = editor.isActive('table')
                return !isTableActive && !editor.state.selection.empty
            }}
            className="flex items-center gap-1 p-1 rounded-lg border bg-background shadow-lg"
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("h-8 w-8", editor.isActive('bold') ? 'bg-muted text-primary' : '')}
                title="粗体"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("h-8 w-8", editor.isActive('italic') ? 'bg-muted text-primary' : '')}
                title="斜体"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn("h-8 w-8", editor.isActive('underline') ? 'bg-muted text-primary' : '')}
                title="下划线"
            >
                <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn("h-8 w-8", editor.isActive('strike') ? 'bg-muted text-primary' : '')}
                title="删除线"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn("h-8 w-8", editor.isActive('code') ? 'bg-muted text-primary' : '')}
                title="代码"
            >
                <Code className="h-4 w-4" />
            </Button>

            <div className="w-px h-4 bg-border mx-1" />

            <LinkPopover editor={editor}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", editor.isActive('link') ? 'bg-muted text-primary' : '')}
                    title="链接"
                >
                    <Link2 className="h-4 w-4" />
                </Button>
            </LinkPopover>
        </BubbleMenu>
    )
}
