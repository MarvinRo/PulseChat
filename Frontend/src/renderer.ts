import './index.css';

// Cria um mock do pulseAPI caso o app esteja rodando no navegador (sem Electron)
if (!window.pulseAPI) {
  console.warn('⚠️ Rodando no modo Web. Mockando window.pulseAPI...');
  window.pulseAPI = {
    sendMessage: (channel, data) => {
      console.log(`[Mock Web] Mensagem enviada para o canal '${channel}':`, data);
    },
    onMessage: (channel, func) => {
      console.log(`[Mock Web] Listener registrado para o canal '${channel}'`);
      return () => {}; // Função de limpeza vazia (unsubscribe)
    },
    platform: 'web',
  };
}

console.log('👋 Olá do processo Renderer!');
console.log(`Rodando na plataforma: ${window.pulseAPI.platform}`);

// Exemplo de como escutar mensagens do processo principal
window.pulseAPI.onMessage('chat:receive', (data) => {
  console.log('[Front-end] Nova mensagem do sistema:', data);
  // Aqui você atualizaria o estado do React/Zustand, por exemplo.
});

// Exemplo de como enviar uma mensagem (pode ser atrelado a um botão no HTML/React)
setTimeout(() => {
  window.pulseAPI.sendMessage('chat:send', {
    user: 'Marvin',
    text: 'Testando a arquitetura limpa do Pulse Chat!'
  });
}, 2000);