"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, X, Loader2, MessageSquare, Bot, Check, RotateCcw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAppStore } from '@/store/useAppStore'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
}

interface AIChatPanelProps {
    isOpen: boolean
    onClose: () => void
}

export default function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
    const { aiMode, setAiMode, editorInstance, startPendingEdit } = useAppStore()
    const [messages, setMessages] = useState<Message[]>([])

    // Set initial greeting based on mode if empty
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: aiMode === 'ask'
                        ? '你好！我是 DeepSeek-V3.2 AI。您可以直接向我提问，或点击左下角切换到 **智能模式 (Agent)** 让直接为您编辑文档。'
                        : '你好！**智能模式 (Agent)** 已开启。我可以为您直接修改文档，请告诉您想做的改动（例如：“帮我重写最后一段”）。',
                    timestamp: new Date(),
                },
            ])
        }
    }, [aiMode, messages.length])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [width, setWidth] = useState(384) // Default 384px (w-96)
    const [isResizing, setIsResizing] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false)
    const modeMenuRef = useRef<HTMLDivElement>(null)

    // Close mode menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
                setIsModeMenuOpen(false)
            }
        }
        if (isModeMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isModeMenuOpen])

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollArea) {
                scrollArea.scrollTop = scrollArea.scrollHeight
            }
        }
    }, [messages, isLoading])

    // Resize Logic
    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }

    const stopResizing = () => {
        setIsResizing(false)
    }

    const resize = (e: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX
            if (newWidth >= 320 && newWidth <= window.innerWidth * 0.8) {
                setWidth(newWidth)
            }
        }
    }

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize)
            window.addEventListener('mouseup', stopResizing)
            document.body.style.cursor = 'ew-resize'
            document.body.style.userSelect = 'none'
        } else {
            window.removeEventListener('mousemove', resize)
            window.removeEventListener('mouseup', stopResizing)
            document.body.style.cursor = 'default'
            document.body.style.userSelect = 'auto'
        }
        return () => {
            window.removeEventListener('mousemove', resize)
            window.removeEventListener('mouseup', stopResizing)
        }
    }, [isResizing])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsgContent = input.trim()
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMsgContent,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const editorContent = editorInstance?.getHTML() || ''

            const systemPrompt = aiMode === 'ask'
                ? `You are a helpful AI assistant integrated into a text editor.
                   CURRENT MODE: ASK (You answer questions and provide suggestions but do NOT attempt to modify the document via tags).
                   The current document content is: \n\n${editorContent.slice(0, 5000)}...`
                : `You are an AI Editor Agent. You have DIRECT PERMISSION to modify the document.
                   CURRENT MODE: AGENT (The user has specifically enabled this mode for you to perform direct edits).
                   When the user asks for changes, provide the full improved HTML content wrapped in <apply_edit> tags. 
                   CRITICAL: Do not include any markdown code fences (like \`\`\`html) around the <apply_edit> tags.
                   Example: <apply_edit><h1>New Title</h1><p>Improved content...</p></apply_edit>
                   Always explain what you changed before or after the tag.
                   Current content: \n\n${editorContent.slice(0, 8000)}`

            const chatMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMsgContent }
            ]

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatMessages }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const error = errorData.error || {}
                throw new Error(JSON.stringify({
                    message: error.message || errorData.error || 'Failed to connect to DeepSeek',
                    code: error.code || 'UNKNOWN_ERROR'
                }))
            }

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No streaming support')

            const assistantId = (Date.now() + 1).toString()
            setMessages((prev) => [...prev, {
                id: assistantId,
                role: 'assistant',
                content: '',
                timestamp: new Date()
            }])

            let accumulatedResponse = ''
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6)
                        if (dataStr === '[DONE]') continue

                        try {
                            const data = JSON.parse(dataStr)
                            const content = data.choices[0]?.delta?.content || ''
                            if (content) {
                                accumulatedResponse += content
                                setMessages((prev) => prev.map(m =>
                                    m.id === assistantId ? { ...m, content: accumulatedResponse } : m
                                ))
                            }
                        } catch (e) {
                            // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            }

            // Auto-trigger preview if an edit was generated in Agent mode
            if (aiMode === 'agent' && accumulatedResponse.includes('<apply_edit>')) {
                applyEdit(accumulatedResponse)
            }
        } catch (error: any) {
            let errorMessage = '未知错误';
            let errorCode = 'UNKNOWN';

            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = errorObj.message || error.message;
                errorCode = errorObj.code || 'UNKNOWN';
            } catch {
                errorMessage = error.message || '未知错误';
            }

            let userFriendlyMessage = `抱歉，连接 DeepSeek 时出错: ${errorMessage}`;

            if (errorCode === 'API_KEY_MISSING') {
                userFriendlyMessage = 'AI 功能暂时不可用: API 密钥未配置。网站管理员需要配置 DEEPSEEK_API_KEY 环境变量。';
            } else if (errorCode === 'RATE_LIMIT_ERROR') {
                userFriendlyMessage = '请求频率过高: 已达到API速率限制，请稍后重试。';
            } else if (errorCode === 'QUOTA_EXHAUSTED') {
                userFriendlyMessage = 'API配额已用尽: 请检查DeepSeek账户余额或升级套餐。';
            } else if (errorCode === 'DEEPSEEK_API_ERROR') {
                // Check for rate limiting or quota errors (fallback for older error formats)
                if (errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('limit')) {
                    userFriendlyMessage = 'DeepSeek API 使用已达限额: 请检查API配额或稍后重试。';
                } else {
                    userFriendlyMessage = `DeepSeek API 错误: ${errorMessage}`;
                }
            } else if (errorCode === 'TIMEOUT_ERROR') {
                userFriendlyMessage = 'AI 响应超时: 请求时间过长，请简化问题或稍后重试。';
            } else if (errorCode === 'NETWORK_ERROR') {
                userFriendlyMessage = '网络连接错误: 无法连接到AI服务，请检查网络连接。';
            } else if (errorCode === 'INTERNAL_SERVER_ERROR') {
                userFriendlyMessage = `服务器内部错误: ${errorMessage}`;
            } else if (errorCode === 'UNKNOWN_API_ERROR') {
                userFriendlyMessage = `未知API错误: ${errorMessage}`;
            }

            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: userFriendlyMessage,
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const applyEdit = (content: string) => {
        if (!editorInstance) {
            console.error('Editor instance not available')
            return
        }

        // Take a snapshot for preview flow
        const currentHTML = editorInstance.getHTML()
        startPendingEdit(currentHTML)

        // Robust regex to handle potential markdown fences if AI ignores instructions
        const match = content.match(/<apply_edit>([\s\S]*?)<\/apply_edit>/)
        if (match && match[1]) {
            try {
                editorInstance.commands.setContent(match[1].trim())
            } catch (err) {
                console.error('Failed to apply edit:', err)
            }
        } else {
            console.warn('No <apply_edit> tags found in content')
        }
    }

    if (!isOpen) return null

    return (
        <div
            className={cn(
                "fixed right-0 top-0 h-full bg-background border-l shadow-lg flex flex-col z-[10001] animate-in slide-in-from-right duration-300 transition-[width]",
                isResizing ? "transition-none shadow-2xl ring-2 ring-primary/20" : ""
            )}
            style={{ width: `${width}px` }}
        >
            {/* Resize Handle */}
            <div
                className={cn(
                    "absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-primary/40 transition-colors z-50",
                    isResizing ? "bg-primary w-1.5" : "bg-transparent"
                )}
                onMouseDown={startResizing}
            />
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm">DeepSeek-V3</h2>
                        <p className="text-[10px] text-primary/70 font-medium uppercase tracking-wider">AI Assistant</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
                <div className="space-y-6 pb-4">
                    {messages.filter(m => m.role !== 'system').map((message) => {
                        const hasEdit = message.content.includes('<apply_edit>')
                        return (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex flex-col',
                                    message.role === 'user' ? 'items-end' : 'items-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[90%] rounded-2xl px-4 py-2.5 shadow-sm',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-muted rounded-tl-none border border-border/50'
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1.5 px-0.5">
                                        <div className={cn(
                                            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                                            message.role === 'user' ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border"
                                        )}>
                                            {message.role === 'user' ? 'YOU' : 'AI'}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "prose prose-sm dark:prose-invert break-words",
                                        message.role === 'user' ? "text-primary-foreground prose-p:text-primary-foreground" : "text-foreground"
                                    )}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content.replace(/<apply_edit>[\s\S]*?<\/apply_edit>/g, '*(已生成文档建议，请查看下方按钮)*')}
                                        </ReactMarkdown>
                                    </div>

                                    {hasEdit && message.role === 'assistant' && (
                                        <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-[10px] text-primary font-medium">
                                                <Sparkles className="h-3 w-3" />
                                                修改建议已自动应用到编辑器
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[10px] opacity-50 mt-2 text-right">
                                        {message.timestamp.toLocaleTimeString('zh-CN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    {isLoading && !messages[messages.length - 1]?.content && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 border border-border/50 shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-xs text-muted-foreground">DeepSeek 正在思考...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-muted/30 p-2 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        placeholder={aiMode === 'ask' ? "向 AI 提问..." : "告诉 AI 如何修改文档..."}
                        className="min-h-[60px] max-h-[200px] resize-none border-none bg-transparent focus-visible:ring-0 p-2 text-sm w-full scrollbar-hidden"
                        disabled={isLoading}
                    />

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                            {/* Mode Selector - Custom Menu (No Popover for robustness) */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 gap-1.5 text-[10px] bg-background/50 hover:bg-background font-medium rounded-lg border border-border/50 shadow-sm transition-all"
                                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                            >
                                {aiMode === 'ask' ? <MessageSquare className="h-3 w-3 text-primary" /> : <Bot className="h-3 w-3 text-primary" />}
                                {aiMode === 'ask' ? '问答' : '智能'}
                                <ChevronDown className={cn("h-2.5 w-2.5 opacity-50 transition-transform", isModeMenuOpen && "rotate-180")} />
                            </Button>

                            {isModeMenuOpen && (
                                <div
                                    ref={modeMenuRef}
                                    className="absolute bottom-full left-0 mb-2 w-32 p-1 bg-popover text-popover-foreground border border-border shadow-xl rounded-lg z-[10005] animate-in fade-in slide-in-from-bottom-2 duration-200"
                                >
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant={aiMode === 'ask' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="h-8 justify-start text-[10px] gap-2 px-2"
                                            onClick={() => {
                                                setAiMode('ask')
                                                setIsModeMenuOpen(false)
                                            }}
                                        >
                                            <MessageSquare className="h-3 w-3" /> 问答模式
                                        </Button>
                                        <Button
                                            variant={aiMode === 'agent' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="h-8 justify-start text-[10px] gap-2 px-2"
                                            onClick={() => {
                                                setAiMode('agent')
                                                setIsModeMenuOpen(false)
                                            }}
                                        >
                                            <Bot className="h-3 w-3" /> 智能模式
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {aiMode === 'agent' && (
                                <span className="text-[10px] text-primary font-medium animate-pulse flex items-center gap-1">
                                    <Sparkles className="h-2.5 w-2.5" /> Agent Active
                                </span>
                            )}
                        </div>

                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="h-7 w-7 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                    {aiMode === 'agent' ? "智能模式下 AI 会提出建议，点击“应用”即可修改文档" : "AI 可能会产生偏差，请核实重要信息"}
                </p>
            </div>
        </div>
    )
}
