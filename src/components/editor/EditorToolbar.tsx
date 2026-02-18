"use client"

import { type Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Strikethrough,
    Underline as UnderlineIcon,
    Code,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Palette,
    RemoveFormatting,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    ImagePlus,
    Table as TableIcon,
    Link2,
    Minus,
    Terminal,
    Download,
    ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, htmlToMarkdown } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LinkPopover } from './LinkPopover'
import { ImagePopover } from './ImagePopover'
import { TableGridSelector } from './TableGridSelector'

const FONT_FAMILIES = [
    { label: '默认字体', value: 'Inter' },
    { label: '微软雅黑', value: '"Microsoft YaHei"' },
    { label: '思源黑体', value: '"Source Han Sans CN"' },
    { label: '思源宋体', value: '"Source Han Serif CN"' },
    { label: '楷体', value: 'KaiTi' },
    { label: '仿宋', value: 'FangSong' },
    { label: 'Monospace', value: 'monospace' },
]

const FONT_SIZES = [
    '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px'
]

interface EditorToolbarProps {
    editor: Editor | null
}

const PRESET_COLORS = [
    { name: '黑色', value: '#000000' },
    { name: '红色', value: '#ef4444' },
    { name: '橙色', value: '#f97316' },
    { name: '黄色', value: '#eab308' },
    { name: '绿色', value: '#22c55e' },
    { name: '蓝色', value: '#3b82f6' },
    { name: '紫色', value: '#a855f7' },
    { name: '粉色', value: '#ec4899' },
]

const HIGHLIGHT_COLORS = [
    { name: '黄色', value: '#fef08a' },
    { name: '绿色', value: '#bbf7d0' },
    { name: '蓝色', value: '#bfdbfe' },
    { name: '粉色', value: '#fbcfe8' },
    { name: '紫色', value: '#e9d5ff' },
    { name: '橙色', value: '#fed7aa' },
]

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
    if (!editor) {
        return null
    }

    return (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex flex-col gap-1 p-1 shadow-sm">
            {/* Row 1: Typography & Basic Formatting */}
            <div className="flex flex-wrap gap-1 items-center px-1">
                {/* Font Family */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs font-normal hover:bg-muted">
                            <span className="truncate max-w-[100px]">
                                {FONT_FAMILIES.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.label || '默认字体'}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                        {FONT_FAMILIES.map(font => (
                            <DropdownMenuItem
                                key={font.value}
                                onClick={() => editor.chain().focus().setFontFamily(font.value).run()}
                                className={cn("text-sm", editor.isActive('textStyle', { fontFamily: font.value }) && "bg-muted font-medium")}
                                style={{ fontFamily: font.value }}
                            >
                                {font.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Font Size */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs font-normal hover:bg-muted">
                            <span className="w-8">
                                {FONT_SIZES.find(s => editor.isActive('textStyle', { fontSize: s })) || '16px'}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                        {FONT_SIZES.map(size => (
                            <DropdownMenuItem
                                key={size}
                                onClick={() => (editor.commands as any).setFontSize(size)}
                                className={cn("text-sm", editor.isActive('textStyle', { fontSize: size }) && "bg-muted font-medium")}
                            >
                                {size}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Bold, Italic, Underline, Strike */}
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

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Text Color */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="文字颜色">
                            <Palette className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <div className="p-2">
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => editor.chain().focus().setColor(color.value).run()}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => editor.chain().focus().unsetColor().run()}>
                                清除颜色
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Highlight */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive('highlight') ? 'bg-muted text-yellow-500' : '')} title="高亮">
                            <Highlighter className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <div className="p-2">
                            <div className="grid grid-cols-3 gap-2">
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        className="w-8 h-6 rounded border border-border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => editor.chain().focus().unsetHighlight().run()}>
                                清除高亮
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    className="h-8 w-8"
                    title="清除所有格式"
                >
                    <RemoveFormatting className="h-4 w-4" />
                </Button>
            </div>

            {/* Row 2: Structure & Elements */}
            <div className="flex flex-wrap gap-1 items-center px-1">
                {/* Headings */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn("h-8 px-2 text-xs font-bold", editor.isActive('heading', { level: 1 }) ? 'bg-muted' : '')}
                >
                    H1
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn("h-8 px-2 text-xs font-bold", editor.isActive('heading', { level: 2 }) ? 'bg-muted' : '')}
                >
                    H2
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={cn("h-8 px-2 text-xs font-bold", editor.isActive('heading', { level: 3 }) ? 'bg-muted' : '')}
                >
                    H3
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Text Alignment */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={cn("h-8 w-8", editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : '')}
                    title="左对齐"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={cn("h-8 w-8", editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : '')}
                    title="居中对齐"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={cn("h-8 w-8", editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : '')}
                    title="右对齐"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Lists & Quote */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("h-8 w-8", editor.isActive('bulletList') ? 'bg-muted' : '')}
                    title="无序列表"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn("h-8 w-8", editor.isActive('orderedList') ? 'bg-muted' : '')}
                    title="有序列表"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn("h-8 w-8", editor.isActive('blockquote') ? 'bg-muted text-primary' : '')}
                    title="引用"
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Elements */}
                <LinkPopover editor={editor}>
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8", editor.isActive('link') ? 'bg-muted text-primary' : '')} title="链接">
                        <Link2 className="h-4 w-4" />
                    </Button>
                </LinkPopover>

                <ImagePopover editor={editor}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="图片">
                        <ImagePlus className="h-4 w-4" />
                    </Button>
                </ImagePopover>

                <TableGridSelector editor={editor}>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={editor.isActive('table')}
                        className={cn("h-8 w-8", editor.isActive('table') ? 'bg-muted text-primary' : '')}
                        title="表格"
                    >
                        <TableIcon className="h-4 w-4" />
                    </Button>
                </TableGridSelector>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    disabled={editor.isActive('table')}
                    className="h-8 w-8"
                    title="分隔线"
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Code */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn("h-8 w-8", editor.isActive('code') ? 'bg-muted text-primary' : '')}
                    title="行内代码"
                >
                    <Code className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={cn("h-8 w-8", editor.isActive('codeBlock') ? 'bg-muted text-primary' : '')}
                    title="代码块"
                >
                    <Terminal className="h-4 w-4" />
                </Button>

                <div className="flex-1" />

                {/* Export */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" title="导出">
                            <Download className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                            const html = editor.getHTML()
                            const mdContent = htmlToMarkdown(html)
                            const blob = new Blob([mdContent], { type: 'text/markdown' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'export.md'
                            a.click()
                        }}>
                            导出为 Markdown (.md)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            const html = editor.getHTML()
                            const blob = new Blob([html], { type: 'text/html' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'export.html'
                            a.click()
                        }}>
                            导出为 HTML
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            const text = editor.getText()
                            const blob = new Blob([text], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'export.txt'
                            a.click()
                        }}>
                            导出为 纯文本
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

export default EditorToolbar
