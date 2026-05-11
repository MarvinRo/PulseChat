import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { RefObject } from "react";

interface PeerChatViewProps {
    selectedContact: any;
    peerMessages: any[];
    currentUser: any;
    peerPrompt: string;
    setPeerPrompt: (val: string) => void;
    handleSendPeer: () => void;
    peerMessagesEndRef: RefObject<HTMLDivElement | null>;
}

export function PeerChatView({ selectedContact, peerMessages, currentUser, peerPrompt, setPeerPrompt, handleSendPeer, peerMessagesEndRef }: PeerChatViewProps) {
    return (
        <div className="flex flex-1 flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center font-bold text-neutral-950">
                    {(selectedContact.nickName || selectedContact.name).charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-semibold text-neutral-50">{selectedContact.nickName || selectedContact.name}</h2>
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
                <div ref={peerMessagesEndRef} />
            </div>

            <div className="p-4 bg-neutral-900 border-t border-neutral-800">
                <div className="max-w-4xl mx-auto relative flex items-center">
                    <Input value={peerPrompt} onChange={(e) => setPeerPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendPeer()} placeholder={`Mensagem para ${selectedContact.nickName || selectedContact.name}...`} className="w-full pr-12 py-6 border-neutral-700 bg-neutral-800 text-neutral-50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary-500" />
                    <Button onClick={handleSendPeer} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary-500 hover:bg-primary-600 text-neutral-950 rounded-lg cursor-pointer">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
