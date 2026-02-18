"use client"

import dynamic from "next/dynamic"
import 'tldraw/tldraw.css'

const Tldraw = dynamic(
    async () => {
        const mod = await import("tldraw")
        return mod.Tldraw
    },
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">加载画板中...</p>
                </div>
            </div>
        ),
    }
)

export default function CanvasWrapper() {
    return (
        <div className="w-full h-full">
            <Tldraw />
        </div>
    )
}
