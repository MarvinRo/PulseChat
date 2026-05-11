import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface ContactsViewProps {
    contacts: any[];
    contactSearchQuery: string;
    setContactSearchQuery: (val: string) => void;
    fetchContacts: (query: string) => void;
    loadChatHistory: (contact: any) => void;
}

export function ContactsView({ contacts, contactSearchQuery, setContactSearchQuery, fetchContacts, loadChatHistory }: ContactsViewProps) {
    return (
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
                <Button onClick={() => fetchContacts(contactSearchQuery)} className="bg-primary-500 hover:bg-primary-600 text-neutral-950 rounded-xl px-6 cursor-pointer">
                    Buscar
                </Button>
            </div>
            
            {contacts.length === 0 ? (
                <p className="text-neutral-400">
                    {contactSearchQuery.trim() === "" 
                        ? "Pesquise por um contato para iniciar uma conversa." 
                        : "Nenhum contato encontrado."}
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                {contacts.map(contact => (
                    <div key={contact.id} onClick={() => loadChatHistory(contact)} className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors text-neutral-50">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center font-bold text-xl text-neutral-950">
                            {(contact.nickName || contact.name).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">{contact.nickName || contact.name}</h3>
                            <p className="text-sm text-neutral-400">{contact.email}</p>
                        </div>
                        <MessageSquare className="w-5 h-5 text-neutral-400" />
                    </div>
                ))}
                </div>
            )}
        </div>
    );
}
