"use client"

import { FloatingMenu } from '@tiptap/react/menus'
import { type Editor } from '@tiptap/react'
import {
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Terminal,
    ImagePlus,
    Table as TableIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePopover } from './ImagePopover'

interface SlashFloatingMenuProps {
    editor: Editor | null
}

export const SlashFloatingMenu = ({ editor }: SlashFloatingMenuProps) => {
    if (!editor) return null

    return (
        <FloatingMenu
            editor={editor}
            className="flex flex-col gap-1 p-1 rounded-lg border bg-background shadow-xl min-w-[180px]"
        >
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">快捷插入</div>

            <Button
                variant="ghost"
                className="justify-start h-9 px-2 gap-2 text-sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1 className="h-4 w-4" />
                <span>一级标题</span>
            </Button>
            <Button
                variant="ghost"
                className="justify-start h-9 px-2 gap-2 text-sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 className="h-4 w-4" />
                <span>二级标题</span>
            </Button>
            <Button
                variant="ghost"
                className="justify-start h-9 px-2 gap-2 text-sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
                <span>无序列表</span>
            </Button>
            <Button
                variant="ghost"
                className="justify-start h-9 px-2 gap-2 text-sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
                <span>有序列表</span>
            </Button>
            <Button
                variant="ghost"
                className="justify-start h-9 px-2 gap-2 text-sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <Quote className="h-4 w-4" />
                <span>引用</span>
            </Button>
            <Button
                variant="ghost"
                className="justify-start h-9 px-2 gap-2 text-sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                <Terminal className="h-4 w-4" />
                <span>代码块</span>
            </Button>

            <div className="h-px bg-border my-1" />

            <ImagePopover editor={editor}>
                <Button
                    variant="ghost"
                    className="justify-start h-9 px-2 gap-2 text-sm w-full"
                >
                    <ImagePlus className="h-4 w-4" />
                    <span>图片</span>
                </Button>
            </ImagePopover>
            <Button
                variant="ghost"
                className="justify-start h-9 px-2 gap-2 text-sm"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
                <TableIcon className="h-4 w-4" />
                <span>表格</span>
            </Button>
        </FloatingMenu>
    )
}
