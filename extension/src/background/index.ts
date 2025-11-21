import { API_ENDPOINTS } from '../shared/constants';
import type { ChatRequest, ChatResponse } from '../shared/types';

// Set up side panel to open when extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Error setting panel behavior:', error));

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener(
  (message: ChatRequest, _sender, sendResponse: (response: ChatResponse) => void) => {
    if (message.type === 'CHAT') {
      handleChatMessage(message.text)
        .then((response) => sendResponse({ response }))
        .catch((error) => sendResponse({ error: error.message }));
      
      // Return true to indicate we'll send a response asynchronously
      return true;
    }
  }
);

async function handleChatMessage(text: string): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: text }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error from backend');
    }
    
    return data.answer || 'No response from Tillu';
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend not running. Please start the backend server.');
    }
    throw error;
  }
}

// Log when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Tillu extension installed:', details.reason);
});

