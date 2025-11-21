export const BACKEND_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  HEALTH: `${BACKEND_URL}/health`,
  CHAT: `${BACKEND_URL}/api/rag/ask`,
  RAG: `${BACKEND_URL}/api/rag`,
  EXTRACT: `${BACKEND_URL}/api/rag/extract`,
  GENERATE: `${BACKEND_URL}/api/rag/generate`,
  SEARCH: `${BACKEND_URL}/api/search`,
};

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  background: '#F9FAFB',
};

