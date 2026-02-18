"use client"

import { Check, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function DiffActionToolbar() {
    const { pendingEdit, finishPendingEdit, revertPendingEdit } = useAppStore()

    if (!pendingEdit?.isApplying) return null

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-3 px-4 py-2 bg-background/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-full animate-in fade-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-primary/10">
            <div className="flex items-center gap-2 pr-3 border-r border-border/50">
                <div className="bg-primary/10 p-1 rounded-full">
                    <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                </div>
                <span className="text-[11px] font-semibold text-foreground tracking-tight whitespace-nowrap">
                    AI 建议预览中
                </span>
            </div>

            <div className="flex items-center gap-1.5 ml-1">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={revertPendingEdit}
                    className="h-7 px-2.5 text-[10px] gap-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all rounded-full"
                >
                    <X className="h-3 w-3" />
                    丢弃
                </Button>
                <Button
                    size="sm"
                    onClick={finishPendingEdit}
                    className="h-7 px-3 text-[10px] gap-1.5 shadow-sm hover:shadow-primary/20 transition-all rounded-full"
                >
                    <Check className="h-3 w-3" />
                    保留
                </Button>
            </div>
        </div>
    )
}
