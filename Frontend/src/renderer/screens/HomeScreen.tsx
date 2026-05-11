/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "@/components/SideBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Field, FieldLabel } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import { io, Socket } from "socket.io-client";
import { WelcomeView } from "@/components/WelcomeView";
import { AiChatView } from "@/components/AiChatView";
import { ContactsView } from "@/components/ContactsView";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PeerChatView } from "@/components/PeerChatView";

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export default function HomeScreen() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [peerPrompt, setPeerPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: 'Olá! Como posso ajudar você hoje com e-mails, revisões ou explicações?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<'welcome' | 'chat' | 'contacts' | 'peer-chat'>('welcome');

    // Estados para o Chat com outros Usuários
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [peerMessages, setPeerMessages] = useState<any[]>([]);
    const [contactSearchQuery, setContactSearchQuery] = useState("");
    const [activeChats, setActiveChats] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    // Estados para o Modal de Conta
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [newNickName, setNewNickName] = useState("");
    const [profileError, setProfileError] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Refs para controlar o final das listas de mensagens
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const peerMessagesEndRef = useRef<HTMLDivElement>(null);

    // Funções de rolagem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const scrollPeerToBottom = () => {
        peerMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Aciona a rolagem sempre que as mensagens do Pulse Ai ou do Peer Chat mudarem
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    useEffect(() => {
        scrollPeerToBottom();
    }, [peerMessages]);

    // Pega as credenciais salvas do Login/Registro para usar nas requisições
    const token = localStorage.getItem("token");
    const currentUserString = localStorage.getItem("user");
    const currentUser = currentUserString ? JSON.parse(currentUserString) : {};

    // Sincroniza o input do modal com o nick atual apenas quando o modal é aberto
    useEffect(() => {
        if (isAccountModalOpen) {
            const storedUser = localStorage.getItem("user");
            const parsedUser = storedUser ? JSON.parse(storedUser) : {};
            setNewNickName(parsedUser?.nickName || parsedUser?.name || "");
            setProfileError("");
        }
    }, [isAccountModalOpen]);

    // Retorna para a tela de boas vindas ao pressionar "Esc"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setCurrentView('welcome');
                setSelectedContact(null);
                setCurrentChatId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Função que chama o backend com o termo de pesquisa
    const fetchContacts = async (query = "") => {
        if (!query.trim()) {
            setContacts([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/messages/contacts?search=${encodeURIComponent(query)}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
            }
        } catch (error) {
            console.error("Erro ao buscar contatos:", error);
        }
    };

    // Limpa a busca e os resultados ao entrar na aba de "Novo chat"
    useEffect(() => {
        if (currentView === 'contacts') {
            setContacts([]);
            setContactSearchQuery("");
        }
    }, [currentView]);

    // Busca a lista de conversas ativas (histórico do menu lateral)
    const fetchActiveChats = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/messages/active-chats", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setActiveChats(data);
            }
        } catch (error) {
            console.error("Erro ao buscar conversas ativas:", error);
        }
    };

    // Carrega os chats ativos logo que o token estiver disponível na tela
    useEffect(() => {
        if (token) fetchActiveChats();
    }, [token]);

    // Inicializa a conexão do Socket.IO e se conecta na sua sala
    useEffect(() => {
        if (!currentUser.id) return;

        const newSocket = io("http://localhost:3001", {
            query: { userId: currentUser.id }
        });
        
        newSocket.on("connect", () => {
            console.log("✅ Conectado ao Socket.IO! Meu ID é:", currentUser.id);
        });

        newSocket.on("connect_error", (err) => {
            console.error("❌ Erro de conexão no Socket.IO:", err.message);
        });
        
        setSocket(newSocket);

        return () => { newSocket.disconnect(); };
    }, [currentUser.id]);

    // Escuta novas mensagens chegando em tempo real do backend
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: any) => {
            console.log("📩 Nova mensagem via Socket recebida:", message);
            
            fetchActiveChats(); // Sempre atualiza o menu lateral

            // Se a mensagem for sua (você é o remetente), ignora o Socket, 
            // pois a função de enviar já colocou ela na tela instantaneamente.
            if (message.senderId === currentUser.id) return;
            
            const isSameChat = currentChatId && message.chatId === currentChatId;
            const isFirstMessage = !currentChatId && selectedContact && message.senderId === selectedContact.id;
            
            // Adiciona na tela se for a conversa atual ou a primeira mensagem da pessoa aberta
            if (isSameChat || isFirstMessage) {
                setPeerMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                
                if (isFirstMessage) setCurrentChatId(message.chatId);
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => { socket.off("newMessage", handleNewMessage); };
    }, [socket, currentChatId, selectedContact, currentUser.id]);

    const handleSend = async () => {
        if (!prompt.trim() || isLoading) return;

        const userMessage = prompt;
        setPrompt("");
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:3001/api/perguntaAi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pergunta: userMessage })
            });

            const data = await res.json();

            if (data.resposta) {
                setMessages(prev => [...prev, { role: 'assistant', text: data.resposta }]);
            } else if (data.error) {
                setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ Erro retornado: ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: 'Desculpe, não consegui obter uma resposta do servidor.' }]);
            }
        } catch (error) {
            console.error("Erro ao comunicar com o servidor:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: 'Erro de conexão com o backend local. Verifique se o servidor Express está rodando.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendPeer = async () => {
        if (!peerPrompt.trim() || !selectedContact) return;
        
        const content = peerPrompt;
        setPeerPrompt(""); // Limpa o input imediatamente para parecer mais responsivo

        // 1. Atualização Otimista (Coloca a mensagem na tela na mesma hora sem depender de rede)
        const tempMessage = {
            id: `temp-${Date.now()}`,
            senderId: currentUser.id,
            content: content,
            createdAt: new Date().toISOString()
        };
        setPeerMessages(prev => [...prev, tempMessage]);

        try {
            const response = await fetch("http://localhost:3001/api/messages/chat", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId: selectedContact.id, content })
            });

            if (response.ok) {
                const savedMessage = await response.json();
                // 2. Substitui a mensagem temporária pela oficial do banco
                setPeerMessages(prev => prev.map(msg => msg.id === tempMessage.id ? savedMessage : msg));
                
                if (!currentChatId) setCurrentChatId(savedMessage.chatId);
                
                fetchActiveChats(); // Atualiza a barra lateral agora que a mensagem está no banco
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    };

    const loadChatHistory = async (contact: any) => {
        setSelectedContact(contact);
        setPeerMessages([]);
        setCurrentChatId(null);
        setCurrentView('peer-chat');

        try {
            const response = await fetch(`http://localhost:3001/api/messages/${contact.id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPeerMessages(data.messages);
                setCurrentChatId(data.chatId);
            }
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
        }
    };

    // Função para deletar o chat no backend e visualmente
    const handleDeleteChat = async (contactId: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/messages/${contactId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error("Erro ao deletar conversa no servidor:", response.status, errData);
                return;
            }
            
            setActiveChats(prev => prev.filter(chat => chat.id !== contactId));
            
            // Se o usuário estiver com esse chat aberto, volta para a tela de boas vindas
            if (selectedContact?.id === contactId) {
                setCurrentView('welcome');
                setSelectedContact(null);
                setCurrentChatId(null);
            }
            
            console.log("Conversa excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar conversa:", error);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newNickName.trim()) {
            setProfileError("O Nickname não pode ser vazio.");
            return;
        }
        setIsUpdatingProfile(true);
        setProfileError("");

        try {
            const response = await fetch(`http://localhost:3001/api/messages/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ nickName: newNickName })
            });

            const data = await response.json();

            if (response.ok) {
                // Atualiza o usuário no localStorage
                const updatedUser = { ...currentUser, nickName: data.user.nickName };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                // Fecha o modal e recarrega a página para refletir a mudança em toda a UI
                setIsAccountModalOpen(false);
                window.location.reload();
            } else {
                setProfileError(data.error || "Erro ao atualizar perfil.");
            }
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            setProfileError("Erro de conexão com o servidor.");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    return (
        <SidebarProvider defaultOpen={false} className="bg-neutral-950 h-screen w-full overflow-hidden">
            <SideBar 
                onSelectView={setCurrentView} 
                activeChats={activeChats} 
                onSelectChat={loadChatHistory} 
                onDeleteChat={handleDeleteChat}
                onOpenAccountModal={() => setIsAccountModalOpen(true)}
            />
            <div className="flex flex-1 flex-col h-full bg-neutral-950 overflow-hidden">
                {/* Barra superior */}
                <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900 h-15">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800" />
                        <h1 className="text-neutral-50 text-xl font-semibold">Pulse Chat</h1>
                    </div>
                    <div>
                        <Field>
                            <ButtonGroup>
                                <Input id="input-button-group" className="w-54" placeholder="O que você está procurando?" />
                                <Button variant="outline">Buscar</Button>
                            </ButtonGroup>
                        </Field>
                    </div>
                </div>

                {/* Modal de Conta */}
                <AlertDialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
                    <AlertDialogContent className="bg-neutral-900 border border-neutral-800 text-neutral-50">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Configurações da Conta</AlertDialogTitle>
                            <AlertDialogDescription className="text-neutral-400">
                                Gerencie suas informações de perfil.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <Field>
                                <FieldLabel>Nickname</FieldLabel>
                                <Input value={newNickName} onChange={(e) => setNewNickName(e.target.value)} placeholder="Seu novo nick" className="border-[#2f3134] border bg-[#2a2a2a] text-white" />
                            </Field>
                            <Field>
                                <FieldLabel>Nova Senha</FieldLabel>
                                <Input type="password" placeholder="••••••••" disabled className="border-[#2f3134] border bg-[#2a2a2a] text-white disabled:opacity-50" />
                            </Field>
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <Input type="email" value={currentUser?.email || ""} disabled className="border-[#2f3134] border bg-[#2a2a2a] text-white disabled:opacity-50" />
                            </Field>
                            {profileError && <p className="text-red-500 text-sm text-center">{profileError}</p>}
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-neutral-800 hover:bg-neutral-700 text-neutral-50 border-0 cursor-pointer">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={(e) => {
                                    e.preventDefault(); // Evita que o modal feche antes de terminar a requisição
                                    handleUpdateProfile();
                                }} 
                                disabled={isUpdatingProfile} 
                                className="bg-[#5865f2] hover:bg-[#4752c4] text-white border-0 cursor-pointer disabled:opacity-50"
                            >
                                {isUpdatingProfile ? "Salvando..." : "Salvar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Views Renderizadas Dinamicamente */}
                {currentView === 'welcome' && <WelcomeView />}

                {currentView === 'chat' && (
                    <AiChatView 
                        messages={messages} 
                        isLoading={isLoading} 
                        prompt={prompt} 
                        setPrompt={setPrompt} 
                        handleSend={handleSend} 
                        messagesEndRef={messagesEndRef} 
                    />
                )}

                {currentView === 'contacts' && (
                    <ContactsView 
                        contacts={contacts} 
                        contactSearchQuery={contactSearchQuery} 
                        setContactSearchQuery={setContactSearchQuery} 
                        fetchContacts={fetchContacts} 
                        loadChatHistory={loadChatHistory} 
                    />
                )}

                {currentView === 'peer-chat' && selectedContact && (
                    <PeerChatView 
                        selectedContact={selectedContact} 
                        peerMessages={peerMessages} 
                        currentUser={currentUser} 
                        peerPrompt={peerPrompt} 
                        setPeerPrompt={setPeerPrompt} 
                        handleSendPeer={handleSendPeer} 
                        peerMessagesEndRef={peerMessagesEndRef} 
                    />
                )}
            </div>
        </SidebarProvider>
)}
