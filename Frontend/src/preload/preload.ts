import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('pulseAPI', {
  // Envia uma mensagem para o Main
  sendMessage: (channel: string, data: any) => {
    const validChannels = ['chat:send', 'app:quit']; // White-list de canais
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Recebe mensagens do Main
  onMessage: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['chat:receive', 'app:status'];
    if (validChannels.includes(channel)) {
      const subscription = (event: IpcRendererEvent, ...args: any[]) => func(...args);
      ipcRenderer.on(channel, subscription);
      // Retorna uma função de limpeza para evitar vazamento de memória (memory leaks)
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    return () => {};
  },
  // Sua propriedade de plataforma que já existia
  platform: process.platform
});

console.log('🚀 Preload: Pulse API injetada com sucesso.');