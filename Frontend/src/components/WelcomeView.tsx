export function WelcomeView() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-neutral-50 p-4">
            <img src="../../public/assets/logo.png" alt="Logo do Pulse Chat" className="w-24 mb-6 opacity-80" />
            <h2 className="text-3xl font-semibold mb-2">Bem-vindo ao Pulse Chat</h2>
            <p className="text-neutral-400 text-center max-w-md">
                Selecione o Pulse Ai no menu lateral para iniciar uma nova conversa e explorar as funcionalidades do nosso assistente inteligente.
            </p>
        </div>
    );
}
