"use client"

import { Calendar, Home, Inbox, Search, Settings, FileText, PenTool } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { useAppStore } from "@/store/useAppStore"

// Menu items.
const items = [
    {
        title: "我的笔记",
        url: "#",
        icon: Home,
    },
    {
        title: "收件箱",
        url: "#",
        icon: Inbox,
    },
    {
        title: "今日日程",
        url: "#",
        icon: Calendar,
    },
    {
        title: "搜索",
        url: "#",
        icon: Search,
    },
    {
        title: "设置",
        url: "#",
        icon: Settings,
    },
]

const files = [
    { title: "Project PRD.md", icon: FileText },
    { title: "Brainstorming.excalidraw", icon: PenTool },
    { title: "Meeting Notes", icon: FileText },
]

export function AppSidebar() {
    const { setViewMode } = useAppStore()

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="font-bold px-4 py-2 text-primary">AI Creative Note</div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Files</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {files.map((file) => (
                                <SidebarMenuItem key={file.title}>
                                    <SidebarMenuButton onClick={() => setViewMode('split')}>
                                        <file.icon className="mr-2 h-4 w-4" />
                                        <span>{file.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4 text-xs text-muted-foreground">Version 0.1.0 (MVP)</div>
            </SidebarFooter>
        </Sidebar>
    )
}
