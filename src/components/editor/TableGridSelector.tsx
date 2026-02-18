"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
import { Grid3X3, Table as TableIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface TableGridSelectorProps {
    editor: Editor | null
    children: React.ReactNode
}

export const TableGridSelector = ({ editor, children }: TableGridSelectorProps) => {
    const [rows, setRows] = React.useState(0)
    const [cols, setCols] = React.useState(0)
    const [open, setOpen] = React.useState(false)

    const MAX_GRID = 10

    const handleSelect = (r: number, c: number) => {
        if (!editor) return
        editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()
        setOpen(false)
        setRows(0)
        setCols(0)
    }

    const disabled = editor?.isActive('table')

    return (
        <Popover open={open && !disabled} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className={cn(disabled && "pointer-events-none opacity-50")}>
                    {children}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-medium">插入表格</span>
                        <span className="text-[10px] text-muted-foreground">{rows > 0 ? `${rows} x ${cols}` : "选择边框"}</span>
                    </div>
                    <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${MAX_GRID}, 1fr)` }}
                        onMouseLeave={() => { setRows(0); setCols(0); }}
                    >
                        {Array.from({ length: MAX_GRID * MAX_GRID }).map((_, i) => {
                            const r = Math.floor(i / MAX_GRID) + 1
                            const c = (i % MAX_GRID) + 1
                            const active = r <= rows && c <= cols

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-5 h-5 border rounded-sm transition-colors cursor-pointer",
                                        active ? "bg-primary border-primary" : "bg-muted/30 border-muted"
                                    )}
                                    onMouseEnter={() => { setRows(r); setCols(c); }}
                                    onClick={() => handleSelect(r, c)}
                                />
                            )
                        })}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-2 justify-start mt-1"
                        onClick={() => {
                            // TODO: Add custom row/col dialog if needed
                            handleSelect(3, 3)
                        }}
                    >
                        <TableIcon className="h-3 w-3" />
                        快速插入 3x3
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
