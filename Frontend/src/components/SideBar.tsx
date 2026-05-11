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
import { BadgeCheckIcon, BellOffIcon, LogOutIcon, MessageSquareXIcon, SettingsIcon, Trash2Icon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertDialog,AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogMedia } from "./ui/alert-dialog";
import { Button } from "./ui/button";



interface SideBarProps {
    onSelectView?: (view: string) => void;
    activeChats?: any[];
    onSelectChat?: (chat: any) => void;
    onDeleteChat?: (contactId: string) => void;
    onOpenAccountModal?: () => void;
}

export function SideBar({ onSelectView, activeChats = [], onSelectChat, onDeleteChat, onOpenAccountModal }: SideBarProps) {
    const navigate = useNavigate();
    const { isMobile, state } = useSidebar();
    const [user, setUser] = useState<{ name: string, nickName?: string, email: string } | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [chatToDelete, setChatToDelete] = useState<any | null>(null);

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

    const getInitials = (userObj: { name: string, nickName?: string }) => {
        const displayName = userObj?.nickName || userObj?.name;
        if (!displayName) return "US";
        return displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-neutral-800 bg-neutral-900">
            <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 border-b border-neutral-800 bg-neutral-900 h-15 flex justify-center">
                <div
                    className="flex justify-center items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 group-data-[collapsible=icon]:p-1 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors"
                    onClick={() => onSelectView?.('welcome')}
                >
                    <img src="../../public/assets/logo.png" alt="Logo do Pulse Chat" className="w-8 shrink-0" />
                    <Label className="text-neutral-50 group-data-[collapsible=icon]:hidden font-medium cursor-pointer">Pulse Chat</Label>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-neutral-900 ">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-neutral-50 group-data-[collapsible=icon]:hidden">Application</SidebarGroupLabel>
                    <SidebarGroupAction className="">
                        <span className="sr-only text-neutral-50">Add Project</span>
                    </SidebarGroupAction>
                    <SidebarGroupContent className="pb-2 border-b gap-6 border-neutral-800">
                        <div
                            className="flex justify-center items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
                            onClick={() => onSelectView?.('chat')}
                        >
                            {icons.aiChat && <span dangerouslySetInnerHTML={{ __html: icons.aiChat }} className="text-neutral-50 shrink-0" />}
                            <Label className="text-neutral-50 group-data-[collapsible=icon]:hidden cursor-pointer">Pulse Ai</Label>
                        </div>
                        <div
                            className="flex justify-center items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
                            onClick={() => onSelectView?.('contacts')}
                        >
                            {icons.msgPlus && <span dangerouslySetInnerHTML={{ __html: icons.msgPlus }} className="text-neutral-50 shrink-0" />}
                            <Label className="text-neutral-50 group-data-[collapsible=icon]:hidden cursor-pointer">Novo chat</Label>
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Novo grupo: Histórico de Conversas */}
                <SidebarGroup>
                    {/* Modal de Exclusão Renderizado Fora do Dropdown */}
                    <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
                        <AlertDialogContent size="sm" className="bg-neutral-900 border border-neutral-800 text-neutral-50">
                            <AlertDialogHeader>
                                <AlertDialogMedia className="bg-red-500/10 text-red-500">
                                    <Trash2Icon />
                                </AlertDialogMedia>
                                <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
                                <AlertDialogDescription className="text-neutral-400">
                                    Isso excluirá a conversa com <strong className="text-neutral-200">{chatToDelete?.name}</strong> permanentemente. Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-neutral-800 hover:bg-neutral-700 text-neutral-50 border-0 cursor-pointer">Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700 text-neutral-50 border-0 cursor-pointer" 
                                    onClick={() => {
                                        if (chatToDelete) {
                                            onDeleteChat?.(chatToDelete.id);
                                            setChatToDelete(null);
                                        }
                                    }}
                                >
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <SidebarGroupLabel className="text-neutral-50 group-data-[collapsible=icon]:hidden">Conversas Recentes</SidebarGroupLabel>
                    <SidebarGroupContent>
                        {activeChats.length === 0 ? (
                            <p className="text-neutral-500 text-xs px-2 group-data-[collapsible=icon]:hidden">Nenhum chat ativo.</p>
                        ) : (
                            activeChats.map((chat: any) => (
                                <div
                                    key={chat.id}
                                    onClick={() => onSelectChat?.(chat)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setOpenDropdownId(chat.id);
                                    }}
                                    className="flex items-center group-data-[collapsible=icon]:justify-center gap-3 p-2 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors mb-1 relative"
                                >
                                    <Avatar className="h-6 w-6 shrink-0 rounded-md">
                                        <AvatarFallback className="bg-primary-500/20 text-primary-500 text-xs rounded-md border border-primary-500/30">
                                            {(chat.nickName || chat.name).charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Label className="text-neutral-50 group-data-[collapsible=icon]:hidden cursor-pointer truncate flex-1">{chat.nickName || chat.name}</Label>
                                    {/* Envolvendo em uma div com stopPropagation para não abrir o chat ao clicar no menu */}
                                <div onClick={(e) => e.stopPropagation()} className="group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:w-px group-data-[collapsible=icon]:h-px group-data-[collapsible=icon]:top-1/2 group-data-[collapsible=icon]:left-full group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
                                        <DropdownMenu 
                                            open={openDropdownId === chat.id} 
                                            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? chat.id : null)}
                                        >
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuButton size="sm" className="hover:bg-neutral-800 cursor-pointer">
                                                    {icons.options && <span dangerouslySetInnerHTML={{ __html: icons.options }} className="text-neutral-50 shrink-0" />}
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-42 bg-neutral-900  border border-neutral-800 text-neutral-50 rounded-lg shadow-lg"
                                                side={isMobile ? "bottom" : "right"}
                                                align="end"
                                                sideOffset={state === "collapsed" ? -18 : 0}
                                                alignOffset={state === "collapsed" ? 18 : 0}
                                            >
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer">
                                                        <BellOffIcon className="mr-2 h-4 w-4" />
                                                        <span>Silenciar conversa</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator className="bg-neutral-800" />
                                                <DropdownMenuItem
                                                    className="hover:bg-neutral-800 cursor-pointer text-red-500 focus:text-red-500 focus:bg-neutral-800"
                                                    onSelect={() => setChatToDelete(chat)}
                                                >
                                                    <MessageSquareXIcon className="mr-2 h-4 w-4" />
                                                    <span>Excluir conversa</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
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
                                        <AvatarFallback className="rounded-lg">{user ? getInitials(user) : "US"}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                                        <span className="truncate font-semibold text-neutral-50">{user?.nickName || user?.name || "Usuário"}</span>
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
                                    <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer" onSelect={onOpenAccountModal}>
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