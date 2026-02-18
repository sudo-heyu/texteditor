"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
import {
    Link2,
    Check,
    X,
    ExternalLink,
    Unlink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface LinkPopoverProps {
    editor: Editor | null
    children: React.ReactNode
}

export const LinkPopover = ({ editor, children }: LinkPopoverProps) => {
    const [url, setUrl] = React.useState("")
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        if (open && editor) {
            const previousUrl = editor.getAttributes("link").href
            if (previousUrl) {
                setUrl(previousUrl)
            } else {
                setUrl("")
            }
        }
    }, [open, editor])

    const setLink = () => {
        if (!editor) return

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            setOpen(false)
            return
        }

        // update link
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        setOpen(false)
    }

    const removeLink = () => {
        if (!editor) return
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">编辑链接</span>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="输入 URL (https://...)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setLink()
                                }
                            }}
                            className="h-8"
                        />
                        <Button size="icon" className="h-8 w-8 shrink-0" onClick={setLink}>
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                    {editor?.isActive("link") && (
                        <div className="flex items-center justify-between mt-1 pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 px-2"
                                onClick={() => window.open(url, "_blank")}
                            >
                                <ExternalLink className="h-3 w-3" />
                                访问
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1 px-2 text-destructive hover:text-destructive"
                                onClick={removeLink}
                            >
                                <Unlink className="h-3 w-3" />
                                移除链接
                            </Button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
