export interface IPulseMessage {
  user: string;
  text: string;
  timestamp?: string;
}

export interface IPulseAPI {
  platform: string;
  sendMessage: (channel: 'chat:send', data: IPulseMessage) => void;
  onMessage: (channel: 'chat:receive', callback: (data: IPulseMessage) => void) => void;
}

declare global {
  interface Window {
    pulseAPI: IPulseAPI;
  }
}