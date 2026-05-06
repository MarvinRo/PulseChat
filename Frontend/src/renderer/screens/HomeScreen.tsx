/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "@/components/SideBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Field, FieldLabel } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import { io, Socket } from "socket.io-client";

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
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);

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

    // Função que chama o backend com o termo de pesquisa
    const fetchContacts = async (query = "") => {
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

    // Carrega a lista inicial (sem filtro) quando abre a aba de "Novo chat"
    useEffect(() => {
        if (currentView === 'contacts') {
            fetchContacts("");
        }
    }, [currentView, token]);

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
        setPeerMessages([]); // Limpa as mensagens antigas antes de carregar as novas
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

    return (
        <SidebarProvider defaultOpen={false} className="bg-neutral-950 h-screen w-full overflow-hidden">
            <SideBar 
                onSelectView={setCurrentView} 
                activeChats={activeChats} 
                onSelectChat={loadChatHistory} 
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

                {currentView === 'welcome' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-50 p-4">
                        <img src="../../public/assets/logo.png" alt="Logo do Pulse Chat" className="w-24 mb-6 opacity-80" />
                        <h2 className="text-3xl font-semibold mb-2">Bem-vindo ao Pulse Chat</h2>
                        <p className="text-neutral-400 text-center max-w-md">
                            Selecione o Pulse Ai no menu lateral para iniciar uma nova conversa e explorar as funcionalidades do nosso assistente inteligente.
                        </p>
                    </div>
                )}

                {currentView === 'chat' && (
                    <>
                        {/* Área de mensagens (Chat) */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-primary-500 text-neutral-50 rounded-br-none' : 'bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-bl-none whitespace-pre-wrap'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[75%] p-4 rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-bl-none animate-pulse">
                                        O assistente está digitando...
                                    </div>
                                </div>
                            )}
                            {/* Âncora invisível para a rolagem automática */}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Área de input do usuário */}
                        <div className="p-4 bg-neutral-900 border-t border-neutral-800">
                            <div className="max-w-4xl mx-auto relative flex items-center">
                                <Input
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                    placeholder="Digite sua mensagem para o assistente..."
                                    className="w-full pr-12 py-6 border-neutral-700 bg-neutral-800 text-neutral-50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary-500"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary-500 hover:bg-primary-600 text-neutral-50 rounded-lg cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* View de Contatos Cadastrados */}
                {currentView === 'contacts' && (
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4">
                        <h2 className="text-2xl font-semibold text-neutral-50 mb-6">Contatos Cadastrados</h2>
                        
                        <div className="w-full max-w-2xl mb-4 flex gap-2">
                            <Input
                                placeholder="Pesquisar por nome ou e-mail..."
                                value={contactSearchQuery}
                                onChange={(e) => setContactSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchContacts(contactSearchQuery)}
                                className="flex-1 border-neutral-700 bg-neutral-800 text-neutral-50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary-500"
                            />
                            <Button 
                                onClick={() => fetchContacts(contactSearchQuery)}
                                className="bg-primary-500 hover:bg-primary-600 text-neutral-950 rounded-xl px-6 cursor-pointer"
                            >
                                Buscar
                            </Button>
                        </div>

                        {contacts.length === 0 ? (
                            <p className="text-neutral-400">Nenhum contato encontrado.</p>
                        ) : (
                            contacts.map(contact => (
                                <div 
                                    key={contact.id} 
                                    onClick={() => loadChatHistory(contact)}
                                    className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors text-neutral-50"
                                >
                                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center font-bold text-xl text-neutral-950">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{contact.name}</h3>
                                        <p className="text-sm text-neutral-400">{contact.email}</p>
                                    </div>
                                    <MessageSquare className="w-5 h-5 text-neutral-400" />
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* View de Chat com Contato Específico (Peer-to-Peer) */}
                {currentView === 'peer-chat' && selectedContact && (
                    <div className="flex flex-1 flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-bold text-neutral-950">
                                {selectedContact.name.charAt(0)}
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-50">{selectedContact.name}</h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {peerMessages.map((msg, index) => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-4 rounded-xl ${isMe ? 'bg-primary-500 text-neutral-50 rounded-br-none' : 'bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-bl-none whitespace-pre-wrap'}`}>
                                            {msg.content || msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Âncora invisível para a rolagem automática do chat P2P */}
                            <div ref={peerMessagesEndRef} />
                        </div>

                        <div className="p-4 bg-neutral-900 border-t border-neutral-800">
                            <div className="max-w-4xl mx-auto relative flex items-center">
                                <Input
                                    value={peerPrompt}
                                    onChange={(e) => setPeerPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendPeer()}
                                    placeholder={`Mensagem para ${selectedContact.name}...`}
                                    className="w-full pr-12 py-6 border-neutral-700 bg-neutral-800 text-neutral-50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary-500"
                                />
                                <Button onClick={handleSendPeer} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary-500 hover:bg-primary-600 text-neutral-950 rounded-lg cursor-pointer">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarProvider>
)}
