"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
import {
    ListTree,
    ChevronRight,
    AlignLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentOutlineProps {
    editor: Editor | null
}

export const DocumentOutline = ({ editor }: DocumentOutlineProps) => {
    const [headings, setHeadings] = React.useState<{ level: number, text: string, id: string }[]>([])

    React.useEffect(() => {
        if (!editor) return

        const updateHeadings = () => {
            const items: { level: number, text: string, id: string }[] = []
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'heading') {
                    items.push({
                        level: node.attrs.level,
                        text: node.textContent,
                        id: `heading-${pos}`
                    })
                }
            })
            setHeadings(items)
        }

        editor.on('update', updateHeadings)
        updateHeadings()

        return () => {
            editor.off('update', updateHeadings)
        }
    }, [editor])

    if (headings.length === 0) return (
        <div className="p-4 text-center text-sm text-muted-foreground animate-in fade-in">
            无文档结构
        </div>
    )

    return (
        <div className="flex flex-col gap-1 p-2 max-h-[400px] overflow-y-auto">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1 border-b pb-2">
                <ListTree className="h-3 w-3" />
                文档大纲
            </div>
            {headings.map((h, i) => (
                <Button
                    key={i}
                    variant="ghost"
                    className={cn(
                        "justify-start h-8 px-2 text-xs truncate w-full group",
                        h.level === 1 ? "font-bold text-foreground" :
                            h.level === 2 ? "font-semibold text-muted-foreground ml-3" :
                                "font-normal text-muted-foreground/80 ml-6"
                    )}
                    onClick={() => {
                        // In a real impl, we'd scroll to the heading
                        // For now just focus
                        editor?.commands.focus()
                    }}
                >
                    <ChevronRight className="h- w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate">{h.text || "无标题"}</span>
                </Button>
            ))}
        </div>
    )
}
