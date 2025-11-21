import { Ollama } from 'ollama';
import config from '../config';

// Initialize Ollama client
const ollama = new Ollama({
  host: config.ollama.host,
});

export interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
}

export interface OllamaError {
  error: string;
  details?: string;
}

/**
 * Send a prompt to Ollama and get a response
 */
export async function generateResponse(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    // Find the actual model name (handles tags)
    const modelName = await findModelName(config.ollama.model);
    
    const messages: Array<{ role: string; content: string }> = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add user prompt
    messages.push({
      role: 'user',
      content: prompt,
    });

    // Generate response
    const response = await ollama.chat({
      model: modelName,
      messages,
      stream: false,
    });

    return response.message.content;
  } catch (error) {
    console.error('Error generating response from Ollama:', error);
    throw new Error(
      `Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if Ollama is running and accessible
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await ollama.list();
    return true;
  } catch (error) {
    console.error('Ollama health check failed:', error);
    return false;
  }
}

/**
 * Get list of available models
 */
export async function listModels(): Promise<string[]> {
  try {
    const response = await ollama.list();
    return response.models.map((model) => model.name);
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

/**
 * Find the actual model name (handles tags like :latest)
 * Returns the full model name if found, or the requested name if not found
 */
export async function findModelName(requestedModel: string): Promise<string> {
  try {
    const models = await listModels();
    
    // Exact match
    if (models.includes(requestedModel)) {
      return requestedModel;
    }
    
    // Check if any model starts with the requested name (handles tags)
    const matchingModel = models.find(model => 
      model === requestedModel || 
      model.startsWith(requestedModel + ':') ||
      model === requestedModel.replace(/:[^:]+$/, '') // Remove tag from requested
    );
    
    if (matchingModel) {
      return matchingModel;
    }
    
    // Return requested model anyway (Ollama might handle it)
    return requestedModel;
  } catch (error) {
    console.error('Error finding model name:', error);
    return requestedModel;
  }
}

/**
 * Test Ollama connection with a simple prompt
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
  model?: string;
}> {
  try {
    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      return {
        success: false,
        message: 'Ollama is not running. Please start Ollama first.',
      };
    }

    // Find the actual model name (handles tags like :latest)
    const actualModelName = await findModelName(config.ollama.model);
    const models = await listModels();
    
    // Check if we found a matching model
    const modelFound = models.some(model => 
      model === config.ollama.model || 
      model.startsWith(config.ollama.model + ':') ||
      actualModelName !== config.ollama.model
    );
    
    if (!modelFound && models.length > 0) {
      return {
        success: false,
        message: `Model ${config.ollama.model} not found. Available models: ${models.join(', ')}`,
      };
    }

    const response = await generateResponse('Say "Hello, Buddy is ready!"');

    return {
      success: true,
      message: response,
      model: actualModelName,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export default {
  generateResponse,
  checkOllamaHealth,
  listModels,
  findModelName,
  testConnection,
};

