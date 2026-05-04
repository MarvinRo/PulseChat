/* eslint-disable import/no-unresolved */
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { icons } from "@/components/SVG"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { BadgeCheckIcon, CreditCardIcon, BellIcon, LogOutIcon, TableConfigIcon, OptionIcon, SettingsIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";



interface SideBarProps {
    onSelectView?: (view: string) => void;
}

export function SideBar({ onSelectView }: SideBarProps) {
    const navigate = useNavigate();
    const { isMobile } = useSidebar();
    const [user, setUser] = useState<{name: string, email: string} | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate('/');
    };

    const getInitials = (name: string) => {
        if (!name) return "US";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-neutral-800 bg-neutral-900">
            <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 border-b border-neutral-800 bg-neutral-900 h-15.25 flex justify-center">
                <div className="flex justify-center items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 group-data-[collapsible=icon]:p-1 rounded-lg transition-colors">
                    <img src="../../public/assets/logo.png" alt="Logo do Pulse Chat" className="w-8 shrink-0" />
                    <Label className="text-neutral-50 group-data-[collapsible=icon]:hidden font-medium">Pulse Chat</Label>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-neutral-900">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-neutral-50 group-data-[collapsible=icon]:hidden">Application</SidebarGroupLabel>
                    <SidebarGroupAction className="">
                        <span className="sr-only text-neutral-50">Add Project</span>
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <div
                            className="flex justify-center items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
                            onClick={() => onSelectView?.('chat')}
                        >
                            {icons.aiChat && <span dangerouslySetInnerHTML={{ __html: icons.aiChat }} className="text-neutral-50 shrink-0" />}
                            <Label className="text-neutral-50 group-data-[collapsible=icon]:hidden cursor-pointer">Pulse Ai</Label>
                        </div>
                        <div className="flex justify-center items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors">
                            {icons.msgPlus && <span dangerouslySetInnerHTML={{ __html: icons.msgPlus }} className="text-neutral-50 shrink-0" />}
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="hover:bg-neutral-800 cursor-pointer">
                                    <Avatar className="h-8 w-8 rounded-lg shrink-0">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
                                        <AvatarFallback className="rounded-lg">{user ? getInitials(user.name) : "US"}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                                        <span className="truncate font-semibold text-neutral-50">{user?.name || "Usuário"}</span>
                                        <span className="truncate text-xs text-neutral-400">{user?.email || "usuario@email.com"}</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                className="w-48 bg-neutral-900  border border-neutral-800 text-neutral-50 rounded-lg shadow-lg" 
                                side={isMobile ? "bottom" : "right"} 
                                align="end" 
                                sideOffset={16}
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer">
                                        <BadgeCheckIcon className="mr-2 h-4 w-4" />
                                        <span>Account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer">
                                        <SettingsIcon className="mr-2 h-4 w-4" />
                                        <span>Configuração</span>
                                    </DropdownMenuItem>
                                    
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className="bg-neutral-800" />
                                <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer text-red-500 focus:text-red-500 focus:bg-neutral-800" onClick={handleLogout}>
                                    <LogOutIcon className="mr-2 h-4 w-4" />
                                    <span>Sair</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
}