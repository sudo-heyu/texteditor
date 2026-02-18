"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
import {
    Search,
    Replace,
    ChevronUp,
    ChevronDown,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FindReplaceProps {
    editor: Editor | null
    onClose: () => void
}

export const FindReplace = ({ editor, onClose }: FindReplaceProps) => {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [replaceTerm, setReplaceTerm] = React.useState("")
    const [matchCount, setMatchCount] = React.useState(0)
    const [currentMatchIndex, setCurrentMatchIndex] = React.useState(0)

    // This is a simplified implementation. 
    // In a real pro-editor, we'd use decorations to highlight matches.
    // For now, we'll use Tiptap commands if available or manual implementation.

    const handleSearch = () => {
        if (!editor || !searchTerm) return
        // @ts-ignore - Assuming we'll add search commands to the editor
        editor.commands.setSearchTerm(searchTerm)
        updateStats()
    }

    const updateStats = () => {
        // Mocking stats for now. In a real impl, the extension would provide this.
        setMatchCount((editor?.storage as any).searchAndReplace?.results.length || 0)
        setCurrentMatchIndex(0)
    }

    const nextMatch = () => {
        // @ts-ignore
        editor?.commands.goToNextMatch()
    }

    const prevMatch = () => {
        // @ts-ignore
        editor?.commands.goToPrevMatch()
    }

    const handleReplace = () => {
        // @ts-ignore
        editor?.commands.replace(replaceTerm)
    }

    const handleReplaceAll = () => {
        // @ts-ignore
        editor?.commands.replaceAll(replaceTerm)
    }

    return (
        <div className="absolute top-16 right-4 z-50 w-72 bg-background border rounded-lg shadow-2xl p-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    查找和替换
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <Input
                        placeholder="查找..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="h-8 pr-16 text-sm"
                    />
                    <div className="absolute right-1 top-1 flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevMatch}>
                            <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMatch}>
                            <ChevronDown className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <Input
                    placeholder="替换为..."
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    className="h-8 text-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" className="h-8 text-xs font-medium" onClick={handleReplace}>
                        替换
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 text-xs font-medium" onClick={handleReplaceAll}>
                        替换全部
                    </Button>
                </div>
            </div>
        </div>
    )
}
