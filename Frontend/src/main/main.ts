import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path'; // Removido 'node:' para garantir compatibilidade

// Contorno para evitar crashs nativos do GTK no Linux
process.env.GTK_USE_PORTAL = '0';
// O GNOME moderno removeu a chave 'font-antialiasing', o que causa um erro fatal (abort) em C++.
// Enganamos o Chromium para que ele não tente checar as configurações do GNOME:
process.env.XDG_CURRENT_DESKTOP = 'X-Generic';

console.log('==== [Pulse Chat] Iniciando Processo Main ====');

// Declarações para evitar erros do TypeScript com as variáveis injetadas pelo Vite
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

// Configurações específicas para estabilidade no Linux (Wayland/X11 e VSync)
if (process.platform === 'linux') {
  // Ativa a detecção inteligente e nativa entre servidores gráficos (Wayland e X11)
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
  // Desativa aceleração de hardware (GPU) que causa crashes na criação da janela no Linux
  app.disableHardwareAcceleration();
  // Sandbox pode causar fechamento repentino devido a permissões do sistema (ex: AppArmor)
  app.commandLine.appendSwitch('no-sandbox');
  // Contorno para o erro de permissão no /dev/shm (Tela Branca)
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  // Desativa o Zygote, que cria bolhas de isolamento e bloqueia o acesso à pasta /tmp no Linux
  app.commandLine.appendSwitch('no-zygote');
  // REMOVIDO: log-level=3 estava escondendo os erros reais de crash do Chromium no terminal.
}

// REMOVIDO temporariamente: A verificação do 'electron-squirrel-startup'
// foi removida pois pode acionar o app.quit() indevidamente no Linux/Mac.

// Manter a referência global evita que a janela seja fechada pelo Garbage Collector
let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  console.log('[Main] Criando a janela do aplicativo...');
  
  try {
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      icon: path.join(__dirname, '../../public/assets/logo.png'),
      backgroundColor: '#131313', // Remove o flash/fundo branco nativo (cor equivalente ao bg-gray-900)
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true, // Segurança máxima ativada
        nodeIntegration: false,
      },
    });
    console.log('[Main] Janela instanciada com sucesso!');
  } catch (error) {
    console.error('[Main] Erro fatal em JS ao tentar criar a janela:', error);
    return;
  }

  console.log('[Main] URL do Vite Server:', typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined' ? MAIN_WINDOW_VITE_DEV_SERVER_URL : 'Não definida');

  // Verificação segura das variáveis do Vite para evitar Crash (ReferenceError)
  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined' && MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    const viteName = typeof MAIN_WINDOW_VITE_NAME !== 'undefined' ? MAIN_WINDOW_VITE_NAME : 'main_window';
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${viteName}/index.html`),
    );
  }

  // REMOVIDO: A abertura automática do DevTools no Linux, combinada com GPU 
  // desativada, frequentemente causa "Segfault" (crash silencioso) no Chromium.
  // Para abrir o DevTools depois, você pode usar o atalho Ctrl+Shift+I.

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  console.log('[Main] Electron está Ready. Inicializando a interface...');
  createWindow();

  // --- Handlers de Comunicação do Pulse Chat ---
  
  // Ouve mensagens enviadas pelo front-end
  ipcMain.on('chat:send', (event, payload) => {
    console.log('[Main] Mensagem recebida da interface:', payload);
    
    // Exemplo: Simulando uma resposta ou broadcast de volta para a interface
    event.reply('chat:receive', {
      user: 'Sistema',
      text: `Recebemos sua mensagem: ${payload.text}`,
      timestamp: new Date().toISOString()
    });
  });

  // Ouve o comando para fechar o app disparado pelo front-end
  ipcMain.on('app:quit', () => {
    app.quit();
  });
});

app.on('window-all-closed', () => {
  console.log('[Main] Todas as janelas foram fechadas. Encerrando o aplicativo...');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});