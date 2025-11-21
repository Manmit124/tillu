export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'tillu' | 'system';
  timestamp: number;
}

export interface ChatRequest {
  type: 'CHAT';
  text: string;
}

export interface ChatResponse {
  response?: string;
  error?: string;
}

export interface BackendStatus {
  connected: boolean;
  lastChecked: number;
}

