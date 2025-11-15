
export enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  STREAMING = 'STREAMING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

export interface SubtitleWord {
  id: string;
  word: string;
}

export interface BroadcastMessage {
  type: 'subtitle' | 'config';
  payload: any;
}
