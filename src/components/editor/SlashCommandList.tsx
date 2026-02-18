"use client"

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react'
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Terminal,
    Table as TableIcon,
    Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const SlashCommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const items = [
        {
            title: '一级标题',
            icon: <Heading1 className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
            },
        },
        {
            title: '二级标题',
            icon: <Heading2 className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
            },
        },
        {
            title: '三级标题',
            icon: <Heading3 className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
            },
        },
        {
            title: '无序列表',
            icon: <List className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
            },
        },
        {
            title: '有序列表',
            icon: <ListOrdered className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
            },
        },
        {
            title: '引用',
            icon: <Quote className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
            },
        },
        {
            title: '代码块',
            icon: <Terminal className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
            },
        },
        {
            title: '表格',
            icon: <TableIcon className="h-4 w-4" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            },
        },
    ]

    const selectItem = (index: number) => {
        const item = items[index]

        if (item) {
            item.command(props)
        }
    }

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: any) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + items.length - 1) % items.length)
                return true
            }

            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % items.length)
                return true
            }

            if (event.key === 'Enter') {
                selectItem(selectedIndex)
                return true
            }

            return false
        },
    }))

    useEffect(() => {
        setSelectedIndex(0)
    }, [props.items])

    return (
        <div className="z-50 min-w-[180px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in zoom-in-95">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">快捷插入</div>
            <div className="flex flex-col gap-0.5">
                {items.map((item, index) => {
                    const isDisabled = item.title === '表格' && props.editor?.isActive('table')

                    return (
                        <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            disabled={isDisabled}
                            className={cn(
                                "w-full justify-start gap-2 px-2 py-1.5 h-auto text-sm font-normal",
                                index === selectedIndex && !isDisabled && "bg-accent text-accent-foreground",
                                isDisabled && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => !isDisabled && selectItem(index)}
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-muted bg-background shadow-sm">
                                {item.icon}
                            </div>
                            {item.title}
                            {isDisabled && <span className="ml-auto text-[10px] text-muted-foreground">(不可嵌套)</span>}
                        </Button>
                    )
                })}
            </div>
        </div>
    )
})

SlashCommandList.displayName = 'SlashCommandList'
