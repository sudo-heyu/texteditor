"use client"

import { useAppStore } from "@/store/useAppStore"
import TiptapEditor from "@/components/editor/TiptapEditor"
import CanvasWrapper from "@/components/canvas/CanvasWrapper"
import AIChatPanel from "@/components/ai/AIChatPanel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sparkles, FileText, Palette, LayoutGrid } from "lucide-react"

export default function MainView() {
    const { activeFileId, documents, isAIPanelOpen, toggleAIPanel, viewMode, setViewMode } = useAppStore()
    const activeDoc = documents.find(d => d.id === activeFileId)

    return (
        <div className="flex flex-col h-full w-full bg-background relative">
            {/* Header */}
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h1 className="text-sm font-medium">{activeDoc?.title || '未命名文档'}</h1>
                </div>

                {/* View Mode Tabs */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="flex-1">
                    <TabsList className="h-9">
                        <TabsTrigger value="editor" className="gap-2">
                            <FileText className="h-3.5 w-3.5" />
                            编辑器
                        </TabsTrigger>
                        <TabsTrigger value="canvas" className="gap-2">
                            <Palette className="h-3.5 w-3.5" />
                            画板
                        </TabsTrigger>
                        <TabsTrigger value="split" className="gap-2">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            分屏
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">自动保存</span>
                    <Button
                        variant={isAIPanelOpen ? "default" : "outline"}
                        size="sm"
                        onClick={toggleAIPanel}
                        className="gap-2"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">AI 助手</span>
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
                {viewMode === 'editor' && (
                    <div className="h-full w-full">
                        <TiptapEditor />
                    </div>
                )}

                {viewMode === 'canvas' && (
                    <div className="h-full w-full">
                        <CanvasWrapper />
                    </div>
                )}

                {viewMode === 'split' && (
                    <ResizablePanelGroup className="h-full w-full">
                        <ResizablePanel defaultSize={50} minSize={30}>
                            <div className="h-full flex flex-col border-r">
                                <div className="h-10 border-b bg-muted/30 flex items-center px-4">
                                    <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">文本编辑器</span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <TiptapEditor />
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

                        <ResizablePanel defaultSize={50} minSize={30}>
                            <div className="h-full flex flex-col">
                                <div className="h-10 border-b bg-muted/30 flex items-center px-4">
                                    <Palette className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground">绘图画板</span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <CanvasWrapper />
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
            </div>

            {/* AI Chat Panel */}
            <AIChatPanel isOpen={isAIPanelOpen} onClose={toggleAIPanel} />
        </div>
    )
}
