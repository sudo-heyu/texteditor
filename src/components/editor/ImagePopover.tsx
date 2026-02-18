"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
import {
    ImagePlus,
    Check,
    Upload,
    Globe,
    Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImagePopoverProps {
    editor: Editor | null
    children: React.ReactNode
}

export const ImagePopover = ({ editor, children }: ImagePopoverProps) => {
    const [url, setUrl] = React.useState("")
    const [open, setOpen] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const insertImageUrl = () => {
        if (!editor || !url) return
        editor.chain().focus().setImage({ src: url }).run()
        setOpen(false)
        setUrl("")
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !editor) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const result = event.target?.result as string
            editor.chain().focus().setImage({ src: result }).run()
            setOpen(false)
        }
        reader.readAsDataURL(file)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <Tabs defaultValue="url" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent h-10">
                        <TabsTrigger value="url" className="text-xs gap-2 data-[state=active]:bg-muted">
                            <Globe className="h-3 w-3" />
                            网络链接
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="text-xs gap-2 data-[state=active]:bg-muted">
                            <Upload className="h-3 w-3" />
                            本地上传
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="p-4 mt-0 space-y-3">
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder="输入图片 URL..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        insertImageUrl()
                                    }
                                }}
                                className="h-8"
                            />
                            <Button size="sm" className="w-full h-8 gap-2" onClick={insertImageUrl} disabled={!url}>
                                <Check className="h-4 w-4" />
                                插入图片
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="upload" className="p-4 mt-0">
                        <div
                            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-xs font-medium">点击选择或拖拽图片</div>
                            <div className="text-[10px] text-muted-foreground">支持 JPG, PNG, GIF</div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    )
}
