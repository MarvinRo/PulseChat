/* eslint-disable import/no-unresolved */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "@/components/SideBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Field, FieldLabel } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export default function HomeScreen() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: 'Olá! Como posso ajudar você hoje com e-mails, revisões ou explicações?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<'welcome' | 'chat'>('welcome');

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

    return (
        <SidebarProvider defaultOpen={false} className="bg-neutral-950">
            <SideBar onSelectView={setCurrentView} />
            <div className="flex flex-1 flex-col h-screen bg-neutral-950">
                {/* Barra superior */}
                <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900">
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

                {currentView === 'welcome' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-50 p-4">
                        <img src="../../public/assets/logo.png" alt="Logo do Pulse Chat" className="w-24 mb-6 opacity-80" />
                        <h2 className="text-3xl font-semibold mb-2">Bem-vindo ao Pulse Chat</h2>
                        <p className="text-neutral-400 text-center max-w-md">
                            Selecione o Pulse Ai no menu lateral para iniciar uma nova conversa e explorar as funcionalidades do nosso assistente inteligente.
                        </p>
                    </div>
                ) : (
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
            </div>
        </SidebarProvider>
    );
}