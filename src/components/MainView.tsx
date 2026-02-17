"use client"

import { useAppStore } from "@/store/useAppStore"
import TiptapEditor from "@/components/editor/TiptapEditor"
import CanvasWrapper from "@/components/canvas/CanvasWrapper"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export default function MainView() {
    const { viewMode } = useAppStore()

    if (viewMode === 'editor') {
        return <TiptapEditor />
    }

    if (viewMode === 'canvas') {
        return <CanvasWrapper />
    }

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
            <ResizablePanel defaultSize={50} minSize={30}>
                <div className="flex h-full items-center justify-center p-0">
                    <TiptapEditor />
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
                <div className="flex h-full items-center justify-center p-0">
                    <CanvasWrapper />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
