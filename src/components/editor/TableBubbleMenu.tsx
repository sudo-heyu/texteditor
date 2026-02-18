"use client"

import { BubbleMenu } from '@tiptap/react/menus'
import { type Editor } from '@tiptap/react'
import {
    Columns,
    Rows,
    Trash2,
    Grid2X2,
    Table as TableIcon,
    ArrowLeftToLine,
    ArrowRightToLine,
    ArrowUpToLine,
    ArrowDownToLine,
    Combine,
    Split,
    Eraser,
    Layout,
    Type,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    PaintBucket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

interface TableBubbleMenuProps {
    editor: Editor | null
}

const COLORS = [
    { name: '默认', value: null },
    { name: '淡蓝', value: '#e0f2fe' },
    { name: '淡绿', value: '#f0fdf4' },
    { name: '淡黄', value: '#fefce8' },
    { name: '淡红', value: '#fef2f2' },
    { name: '淡灰', value: '#f9fafb' },
    { name: '亮黄', value: '#fef08a' },
]

export const TableBubbleMenu = ({ editor }: TableBubbleMenuProps) => {
    if (!editor) return null

    const shouldShow = ({ editor }: { editor: Editor }) => {
        return editor.isActive('table')
    }

    const setCellBackground = (color: string | null) => {
        editor.chain().focus().setCellAttribute('backgroundColor', color).run()
    }

    return (
        <BubbleMenu
            editor={editor}
            shouldShow={shouldShow}
            className="flex items-center gap-0.5 p-1 rounded-lg border bg-background shadow-xl animate-in fade-in zoom-in-95"
        >
            {/* Cell Actions */}
            <div className="flex items-center gap-0.5 px-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().mergeCells().run()}
                    disabled={!editor.can().mergeCells()}
                    className="h-8 px-2 text-xs gap-1.5"
                >
                    <Combine className="h-3.5 w-3.5" />
                    合并
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().splitCell().run()}
                    disabled={!editor.can().splitCell()}
                    className="h-8 px-2 text-xs gap-1.5"
                >
                    <Split className="h-3.5 w-3.5" />
                    拆分
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Background Color */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1.5 focus:ring-0">
                        <PaintBucket className="h-3.5 w-3.5" />
                        背景
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 p-1 bg-background border shadow-md z-[1100]">
                    <div className="grid grid-cols-4 gap-1 p-1">
                        {COLORS.map((color) => (
                            <button
                                key={color.name}
                                className={cn(
                                    "h-6 w-6 rounded border border-muted hover:border-primary transition-all",
                                    !color.value && "bg-background relative after:absolute after:inset-0 after:bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]"
                                )}
                                style={{ backgroundColor: color.value || 'transparent' }}
                                onClick={() => setCellBackground(color.value)}
                                title={color.name}
                            />
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Text Formatting Dropdown */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1.5">
                        <Type className="h-3.5 w-3.5" />
                        文字
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-1 bg-background border shadow-md z-[1100]">
                    <div className="flex items-center justify-between p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={cn("h-8 w-8", editor.isActive('bold') && "bg-accent")}
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={cn("h-8 w-8", editor.isActive('italic') && "bg-accent")}
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={cn("h-8 w-8", editor.isActive('underline') && "bg-accent")}
                        >
                            <UnderlineIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={cn("h-8 w-8", editor.isActive('strike') && "bg-accent")}
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Button>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()}>
                        <Code className="h-4 w-4 mr-2" />
                        代码格式
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Row Operations */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1.5">
                        <Rows className="h-3.5 w-3.5" />
                        行
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 bg-background border shadow-md z-[1100]">
                    <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
                        <ArrowUpToLine className="h-4 w-4 mr-2" />
                        上方插入
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        下方插入
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除行
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Operations */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1.5">
                        <Columns className="h-3.5 w-3.5" />
                        列
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 bg-background border shadow-md z-[1100]">
                    <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
                        <ArrowLeftToLine className="h-4 w-4 mr-2" />
                        左侧插入
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                        <ArrowRightToLine className="h-4 w-4 mr-2" />
                        右侧插入
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除列
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Styles & Overall */}
            <div className="flex items-center gap-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                    className={cn("h-8 w-8", editor.isActive('table', { headerRow: true }) && "bg-accent text-accent-foreground")}
                    title="切换表头行"
                >
                    <Layout className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="删除表格"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </BubbleMenu>
    )
}
