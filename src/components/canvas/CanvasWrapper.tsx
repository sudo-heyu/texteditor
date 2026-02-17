"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    {
        ssr: false,
        loading: () => <div className="w-full h-full flex items-center justify-center bg-muted">加载画板中...</div>,
    }
)

export default function CanvasWrapper() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-full h-full flex items-center justify-center bg-muted">加载画板中...</div>
    }

    return (
        <div className="w-full h-full border-l">
            <Excalidraw
                langCode="zh-CN"
                theme="light"
                name="AI Notebook Sketch"
            />
        </div>
    )
}
