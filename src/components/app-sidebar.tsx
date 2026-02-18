"use client"

import { Calendar, Home, Inbox, Search, Settings, FileText, PenTool, Plus, Upload, Download, Trash2, FileJson, Sparkles } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import { useAppStore, FileDocument } from "@/store/useAppStore"
import { useRef } from "react"
import { cn, htmlToMarkdown } from "@/lib/utils"

export function AppSidebar() {
    const {
        activeFileId,
        setActiveFileId,
        toggleAIPanel,
        documents,
        addDocument,
        removeDocument,
        createNewFile
    } = useAppStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        Array.from(files).forEach(file => {
            const reader = new FileReader()
            reader.onload = (event) => {
                const content = event.target?.result as string
                // Wrap content in basic HTML if it's plain text/markdown
                const htmlContent = content.startsWith('<')
                    ? content
                    : `<h1>${file.name}</h1><pre>${content}</pre>`

                addDocument({
                    title: file.name,
                    content: htmlContent
                })
            }
            reader.readAsText(file)
        })

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDownload = (doc: FileDocument) => {
        const mdContent = htmlToMarkdown(doc.content)
        const blob = new Blob([mdContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        // Strictly Markdown (.md)
        const filename = doc.title.replace(/\.[^/.]+$/, "") + ".md"
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-4">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <PenTool className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold">超级编辑器</span>
                        <span className="text-[10px] text-muted-foreground">Professional Edition</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                            文档管理
                        </SidebarGroupLabel>
                        <div className="flex items-center gap-1">
                            <input
                                type="file"
                                multiple
                                accept=".txt,.md,.html"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleUpload}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                title="上传文件"
                            >
                                <Upload className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={createNewFile}
                                title="新建文档"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {documents.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-xs text-muted-foreground">暂无文档</p>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <SidebarMenuItem key={doc.id}>
                                        <SidebarMenuButton
                                            onClick={() => setActiveFileId(doc.id)}
                                            isActive={activeFileId === doc.id}
                                            className="group/item"
                                        >
                                            <FileText className="mr-2 h-4 w-4 text-muted-foreground group-data-[active=true]/item:text-primary" />
                                            <span className="truncate flex-1">{doc.title}</span>
                                        </SidebarMenuButton>
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                title="下载为 Markdown (.md)"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation()
                                                    handleDownload(doc)
                                                }}
                                            >
                                                <Download className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                title="永久删除"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation()
                                                    if (window.confirm(`确定要永久删除“${doc.title}”吗？此操作不可撤销。`)) {
                                                        removeDocument(doc.id)
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>快速开始</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="搜索文档">
                                    <Search className="h-4 w-4" />
                                    <span>搜索文档</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="系统设置">
                                    <Settings className="h-4 w-4" />
                                    <span>设置</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4">
                    <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-primary/20 p-1 rounded-md">
                                <Sparkles className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-primary">AI Assistant</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
                            通过智能模式，AI 可以直接帮您编辑和优化这些文档。
                        </p>
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full h-8 text-[11px] rounded-lg shadow-sm"
                            onClick={toggleAIPanel}
                        >
                            启动 AI 创作助手
                        </Button>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}

function Button({ className, variant, size, ...props }: any) {
    const variants: any = {
        ghost: "hover:bg-accent hover:text-accent-foreground",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
    }
    const sizes: any = {
        icon: "h-9 w-9",
        sm: "h-8 px-3",
    }
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                variants[variant || "default"],
                sizes[size || "default"],
                className
            )}
            {...props}
        />
    )
}
