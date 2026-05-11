import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { RefObject } from "react";

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

interface AiChatViewProps {
    messages: Message[];
    isLoading: boolean;
    prompt: string;
    setPrompt: (val: string) => void;
    handleSend: () => void;
    messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function AiChatView({ messages, isLoading, prompt, setPrompt, handleSend, messagesEndRef }: AiChatViewProps) {
    return (
        <>
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
                <div ref={messagesEndRef} />
            </div>

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
                    <Button onClick={handleSend} disabled={isLoading} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary-500 hover:bg-primary-600 text-neutral-50 rounded-lg cursor-pointer disabled:opacity-50">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}
