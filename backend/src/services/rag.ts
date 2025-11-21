import { searchDocuments } from './vectorDB';
import { generateResponse } from './ollama';
import { RAGContext, SearchResult } from '../types';

/**
 * Build context from search results
 */
function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant information found.';
  }
  
  const contextParts = results.map((result, index) => {
    return `[${index + 1}] ${result.content}`;
  });
  
  return contextParts.join('\n\n');
}

/**
 * Generate a response using RAG (Retrieval-Augmented Generation)
 */
export async function generateRAGResponse(
  query: string,
  options: {
    numResults?: number;
    filter?: Record<string, any>;
    systemPrompt?: string;
  } = {}
): Promise<{
  response: string;
  context: RAGContext;
}> {
  try {
    const { numResults = 5, filter, systemPrompt } = options;
    
    // Step 1: Search for relevant documents
    const relevantDocs = await searchDocuments(query, numResults, filter);
    
    // Step 2: Build context from results
    const context = buildContext(relevantDocs);
    
    // Step 3: Build the prompt with context
    const promptWithContext = `Context about Manmit Tiwade:
${context}

User question: ${query}

Please answer the question using the context provided above. Be specific and use the information from the context. If the context doesn't contain relevant information, say so.`;
    
    // Step 4: Generate response using Ollama
    const defaultSystemPrompt = `You are Buddy, a personal AI assistant for Manmit Tiwade. You have access to Manmit's personal information, professional background, skills, and preferences. Always respond as if you ARE Manmit when asked about personal details (use "I" and "my"). Be helpful, accurate, and use the provided context to give specific answers.`;
    
    const response = await generateResponse(
      promptWithContext,
      systemPrompt || defaultSystemPrompt
    );
    
    return {
      response,
      context: {
        query,
        relevantDocs,
        context,
      },
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
}

/**
 * Answer a specific question about personal information
 */
export async function answerPersonalQuestion(question: string): Promise<string> {
  try {
    const result = await generateRAGResponse(question, {
      numResults: 3,
      systemPrompt: `You are answering on behalf of Manmit Tiwade. Use first person ("I", "my", "me"). Be concise and direct. Only use information from the provided context.`,
    });
    
    return result.response;
  } catch (error) {
    console.error('Error answering personal question:', error);
    throw error;
  }
}

/**
 * Get form fill data for a specific field type
 */
export async function getFormFillData(fieldType: string): Promise<string> {
  try {
    const queries: Record<string, string> = {
      firstName: 'What is my first name?',
      lastName: 'What is my last name?',
      fullName: 'What is my full name?',
      email: 'What is my email address?',
      phone: 'What is my phone number?',
      address: 'What is my full address?',
      city: 'What city do I live in?',
      state: 'What state do I live in?',
      country: 'What country do I live in?',
      zipCode: 'What is my zip code?',
      linkedin: 'What is my LinkedIn URL?',
      github: 'What is my GitHub URL?',
      portfolio: 'What is my portfolio URL?',
    };
    
    const query = queries[fieldType] || `What is my ${fieldType}?`;
    
    const result = await generateRAGResponse(query, {
      numResults: 2,
      systemPrompt: `Extract and return ONLY the specific information requested. No explanations, no extra text. Just the answer.`,
    });
    
    return result.response.trim();
  } catch (error) {
    console.error(`Error getting form fill data for ${fieldType}:`, error);
    return '';
  }
}

/**
 * Generate a cover letter for a job
 */
export async function generateCoverLetter(jobDescription: string): Promise<string> {
  try {
    const query = `Based on this job description, write a cover letter: ${jobDescription}`;
    
    const result = await generateRAGResponse(query, {
      numResults: 10,
      systemPrompt: `You are writing a cover letter on behalf of Manmit Tiwade. Use the context to highlight relevant skills and experiences that match the job description. Write in first person. Be professional but friendly. Keep it concise (3-4 paragraphs). Format it as a proper cover letter.`,
    });
    
    return result.response;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}

/**
 * Answer a job application question
 */
export async function answerJobQuestion(
  question: string,
  jobContext?: string
): Promise<string> {
  try {
    const query = jobContext
      ? `Job context: ${jobContext}\n\nQuestion: ${question}`
      : question;
    
    const result = await generateRAGResponse(query, {
      numResults: 8,
      systemPrompt: `You are answering a job application question on behalf of Manmit Tiwade. Use the context to provide specific examples and experiences. Write in first person. Be professional, concise, and highlight relevant achievements. Keep the answer to 2-3 paragraphs unless the question requires more detail.`,
    });
    
    return result.response;
  } catch (error) {
    console.error('Error answering job question:', error);
    throw error;
  }
}

export default {
  generateRAGResponse,
  answerPersonalQuestion,
  getFormFillData,
  generateCoverLetter,
  answerJobQuestion,
};

