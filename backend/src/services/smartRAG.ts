import { searchDocuments } from './vectorDB';
import { generateResponse } from './ollama';
import { buildEnhancedContext, buildContextSummary, extractKeyFacts } from './contextBuilder';
import { SearchResult } from '../types';

/**
 * Smart RAG Service
 * 
 * One intelligent service that handles all RAG use cases:
 * - Questions
 * - Form filling
 * - Cover letters
 * - Job applications
 * - General chat
 */

// Intent types
type Intent = 'extract' | 'explain' | 'generate' | 'chat' | 'auto';

// Format types
type Format = 'short' | 'bullets' | 'paragraph' | 'essay' | 'raw';

interface RAGRequest {
  query: string;
  intent?: Intent;
  format?: Format;
  context?: {
    jobDescription?: string;
    fieldType?: string;
    maxLength?: number;
    [key: string]: any;
  };
  options?: {
    numResults?: number;
    minScore?: number;
    includeContext?: boolean;
  };
}

interface RAGResponse {
  answer: string;
  intent: Intent;
  format: Format;
  confidence: number;
  contextUsed: string[];
  metadata: {
    searchResults: number;
    avgRelevance: number;
    processingTime: number;
  };
}

/**
 * Expand query for better search results
 */
function expandQuery(query: string, intent: Intent): string {
  const lowerQuery = query.toLowerCase();
  
  // For extract intent, add synonyms and related terms
  if (intent === 'extract') {
    if (lowerQuery.includes('email')) {
      return `${query} email address contact information`;
    }
    if (lowerQuery.includes('phone')) {
      return `${query} phone number telephone contact mobile`;
    }
    if (lowerQuery.includes('name')) {
      return `${query} name identity`;
    }
    if (lowerQuery.includes('address')) {
      return `${query} address location residence`;
    }
    if (lowerQuery.includes('city') || lowerQuery.includes('live')) {
      return `${query} city location address residence`;
    }
    if (lowerQuery.includes('linkedin') || lowerQuery.includes('github') || lowerQuery.includes('portfolio')) {
      return `${query} links profile social media`;
    }
  }
  
  return query;
}

/**
 * Detect intent from query
 */
function detectIntent(query: string, context?: any): Intent {
  const lowerQuery = query.toLowerCase();
  
  // Extract patterns - be more aggressive
  if (
    lowerQuery.includes('what is my') ||
    lowerQuery.includes('what\'s my') ||
    lowerQuery.includes('get my') ||
    lowerQuery.includes('find my') ||
    lowerQuery.includes('extract') ||
    lowerQuery.includes('where do i live') ||
    lowerQuery.includes('what city') ||
    lowerQuery.includes('my email') ||
    lowerQuery.includes('my phone') ||
    lowerQuery.includes('my linkedin') ||
    lowerQuery.includes('my github') ||
    lowerQuery.includes('my portfolio') ||
    context?.fieldType
  ) {
    return 'extract';
  }
  
  // Generate patterns
  if (
    lowerQuery.includes('write') ||
    lowerQuery.includes('generate') ||
    lowerQuery.includes('create') ||
    lowerQuery.includes('cover letter') ||
    lowerQuery.includes('compose') ||
    context?.jobDescription
  ) {
    return 'generate';
  }
  
  // Explain patterns
  if (
    lowerQuery.includes('explain') ||
    lowerQuery.includes('describe') ||
    lowerQuery.includes('tell me about') ||
    lowerQuery.includes('how') ||
    lowerQuery.includes('why')
  ) {
    return 'explain';
  }
  
  // Default to chat
  return 'chat';
}

/**
 * Detect desired format from query and context
 */
function detectFormat(query: string, intent: Intent, context?: any): Format {
  const lowerQuery = query.toLowerCase();
  
  // Explicit format requests
  if (lowerQuery.includes('bullet') || lowerQuery.includes('list')) {
    return 'bullets';
  }
  
  if (lowerQuery.includes('brief') || lowerQuery.includes('short')) {
    return 'short';
  }
  
  if (lowerQuery.includes('essay') || lowerQuery.includes('detailed')) {
    return 'essay';
  }
  
  // Intent-based defaults
  if (intent === 'extract') {
    // For extract intent, check if it's a simple field extraction
    const simpleFields = ['email', 'phone', 'name', 'address', 'city', 'state', 'country', 'zip'];
    const isSimpleField = simpleFields.some(field => lowerQuery.includes(field));
    
    if (isSimpleField || context?.fieldType) {
      return 'raw';  // Return just the value
    }
    return 'short';  // Return with minimal context
  }
  
  if (intent === 'generate') {
    return 'essay';
  }
  
  if (intent === 'explain') {
    return 'paragraph';
  }
  
  return 'paragraph';
}

/**
 * Build system prompt based on intent and format
 */
function buildSystemPrompt(intent: Intent, format: Format, context?: any): string {
  const basePrompt = `You are Buddy, a personal AI assistant for Manmit Tiwade. You have access to Manmit's personal information, professional background, skills, and preferences.`;
  
  let intentPrompt = '';
  
  switch (intent) {
    case 'extract':
      intentPrompt = `Extract ONLY the specific information requested. Be precise and concise. Use first person ("I", "my", "me") when appropriate. NO explanations, NO extra context, NO preamble.`;
      break;
    
    case 'explain':
      intentPrompt = `Provide a clear, concise explanation using the context. Use first person ("I", "my", "me"). Be direct and specific. Keep it under 3 sentences unless more detail is explicitly requested. NO unnecessary elaboration.`;
      break;
    
    case 'generate':
      intentPrompt = `Generate professional, well-written content on behalf of Manmit. Use first person. Be authentic and highlight relevant experiences and skills from the context. Be concise and impactful.`;
      break;
    
    case 'chat':
      intentPrompt = `Respond naturally as if you ARE Manmit. Use first person. Be helpful, direct, and accurate. Keep responses concise - 2-3 sentences maximum unless asked for more detail.`;
      break;
  }
  
  let formatPrompt = '';
  
  switch (format) {
    case 'raw':
      formatPrompt = `Return ONLY the exact value requested. No explanation, no sentences, no "your email is" or similar phrases. Just the pure value itself. For example, if asked for email, return only: manmittiwade@gmail.com`;
      break;
    
    case 'short':
      formatPrompt = `Answer in ONE sentence only. Be extremely concise and direct. NO preamble like "I'd be happy to help" or "As a developer". Start directly with the answer. Maximum 15 words.`;
      break;
    
    case 'bullets':
      formatPrompt = `Format your response as bullet points ONLY. No introduction, no preamble, no "Here are the languages". Just start with the first bullet point. Each point should be clear and concise.`;
      break;
    
    case 'paragraph':
      formatPrompt = `Provide a concise response in 1-2 paragraphs maximum. Be clear and informative. NO unnecessary elaboration, NO "As a developer" introductions, just answer the question directly.`;
      break;
    
    case 'essay':
      formatPrompt = `Write a comprehensive, well-structured response. Use multiple paragraphs. Be professional and detailed.`;
      break;
  }
  
  // Add context-specific instructions
  let contextPrompt = '';
  if (context?.jobDescription) {
    contextPrompt = `\n\nJob Context: Tailor your response to match the job requirements. Highlight relevant skills and experiences.`;
  }
  
  return `${basePrompt}\n\n${intentPrompt}\n\n${formatPrompt}${contextPrompt}`;
}

/**
 * Build user prompt with context
 */
function buildUserPrompt(
  query: string,
  contextText: string,
  intent: Intent,
  additionalContext?: any
): string {
  let prompt = `Context about Manmit Tiwade:\n${contextText}\n\n`;
  
  // Add additional context if provided
  if (additionalContext?.jobDescription) {
    prompt += `Job Description:\n${additionalContext.jobDescription}\n\n`;
  }
  
  // Add query
  if (intent === 'extract') {
    prompt += `Extract the following information: ${query}`;
  } else if (intent === 'generate') {
    prompt += `Task: ${query}`;
  } else {
    prompt += `Question: ${query}`;
  }
  
  // Add constraints
  if (additionalContext?.maxLength) {
    prompt += `\n\nMaximum length: ${additionalContext.maxLength} words.`;
  }
  
  return prompt;
}

/**
 * Extract value directly from search results (bypassing LLM for simple fields)
 */
function extractDirectly(query: string, results: SearchResult[]): string | null {
  if (results.length === 0) return null;
  
  const lowerQuery = query.toLowerCase();
  const content = results[0].content; // Use top result
  
  // URL extraction FIRST (highest priority for clean extraction)
  if (lowerQuery.match(/\b(linkedin|github|portfolio|url|link)\b/i)) {
    const urlMatch = content.match(/https?:\/\/[^\s,)]+/);
    if (urlMatch) {
      let url = urlMatch[0];
      url = url.replace(/[.,;!?)\]]+$/, '');
      return url;
    }
  }
  
  // Email extraction
  if (lowerQuery.includes('email')) {
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) return emailMatch[0];
  }
  
  // Phone extraction
  if (lowerQuery.includes('phone') || lowerQuery.includes('telephone') || lowerQuery.includes('mobile') || lowerQuery.includes('number')) {
    // Try to find phone number pattern
    const phoneMatch = content.match(/[\+]?[1]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}/);
    if (phoneMatch) return phoneMatch[0];
    
    // Fallback to more general pattern
    const generalPhone = content.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);
    if (generalPhone) return generalPhone[0];
  }
  
  // URL extraction (LinkedIn, GitHub, Portfolio) - prioritize this
  if (lowerQuery.match(/\b(linkedin|github|portfolio|url|link)\b/i)) {
    const urlMatch = content.match(/https?:\/\/[^\s,)]+/);
    if (urlMatch) {
      // Clean up URL thoroughly
      let url = urlMatch[0];
      url = url.replace(/[.,;!?)\]]+$/, ''); // Remove trailing punctuation
      return url;
    }
  }
  
  // Name extraction
  if (lowerQuery.includes('first name')) {
    const match = content.match(/first name[:\s]+([A-Z][a-z]+)/i);
    if (match) return match[1];
  }
  
  if (lowerQuery.includes('last name')) {
    const match = content.match(/last name[:\s]+([A-Z][a-z]+)/i);
    if (match) return match[1];
  }
  
  if (lowerQuery.includes('full name') || lowerQuery.match(/\bname\b/)) {
    const match = content.match(/(?:name is|I am|I'm)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    if (match) return match[1];
  }
  
  // City/Location extraction - be more aggressive
  if (lowerQuery.match(/\b(city|where do i live|where am i|location|live)\b/i)) {
    // Try multiple patterns for city extraction
    let match = content.match(/live in ([A-Z][a-z]+),/i);
    if (match) return match[1];
    
    match = content.match(/city[:\s]+([A-Z][a-z]+)/i);
    if (match) return match[1];
    
    // Extract city from "City, State, Country" pattern
    match = content.match(/([A-Z][a-z]+),\s+[A-Z][a-z]+,\s+[A-Z]/);
    if (match) return match[1];
    
    // Extract from address pattern "123 Street, City, State"
    match = content.match(/\d+[^,]+,\s+([A-Z][a-z]+),/);
    if (match) return match[1];
  }
  
  // State extraction
  if (lowerQuery.includes('state')) {
    const match = content.match(/(?:state[:\s]+|,\s+)([A-Z][a-z]+)(?:,|\.|$)/i);
    if (match) return match[1];
  }
  
  // Country extraction
  if (lowerQuery.includes('country')) {
    const match = content.match(/(?:country[:\s]+|,\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?:\.|$)/i);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Validate and format response
 */
function validateResponse(response: string, format: Format): string {
  let validated = response.trim();
  
  // Remove common LLM artifacts and verbose introductions
  validated = validated.replace(/^(Answer:|Response:|Here's|Here is|I'd be happy to|Let me|Sure,|Of course,)/i, '').trim();
  validated = validated.replace(/^(help you|tell you|share|explain)\s+(with|about|that)?[:\s]*/i, '').trim();
  
  // Format-specific validation
  if (format === 'raw') {
    // Extract just the value, remove any explanation
    
    // Try to find email pattern
    const emailMatch = validated.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      return emailMatch[0];
    }
    
    // Try to find phone pattern
    const phoneMatch = validated.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);
    if (phoneMatch && validated.toLowerCase().includes('phone')) {
      return phoneMatch[0];
    }
    
    // Try to find URL pattern
    const urlMatch = validated.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      return urlMatch[0];
    }
    
    // Look for patterns like "is [value]" or "address is [value]"
    const isMatch = validated.match(/(?:is|:)\s+([^.,\n]+)/);
    if (isMatch) {
      validated = isMatch[1].trim();
    }
    
    // Remove common prefixes
    validated = validated.replace(/^(my |your |the |it is |it's )/i, '').trim();
    
    // Take first line only
    const lines = validated.split('\n');
    validated = lines[0].trim();
    
    // Remove quotes if present
    validated = validated.replace(/^["']|["']$/g, '');
    
    // Remove trailing punctuation for raw values
    validated = validated.replace(/[.,;!?]$/, '');
  }
  
  if (format === 'short') {
    // Ensure it's actually short
    const sentences = validated.split(/[.!?]\s+/);
    if (sentences.length > 2) {
      validated = sentences.slice(0, 2).join('. ') + '.';
    }
  }
  
  return validated;
}

/**
 * Main smart RAG function
 */
export async function smartRAG(request: RAGRequest): Promise<RAGResponse> {
  const startTime = Date.now();
  
  try {
    const {
      query,
      intent: requestedIntent,
      format: requestedFormat,
      context,
      options = {},
    } = request;
    
    // Detect intent and format if not provided
    const intent = requestedIntent || detectIntent(query, context);
    const format = requestedFormat || detectFormat(query, intent, context);
    
    // Determine search parameters based on intent
    let numResults = options.numResults || 5;
    let minScore = options.minScore || 0.3;
    
    if (intent === 'extract') {
      numResults = 5; // Get more results to increase chances
      minScore = 0.25; // Lower threshold for extraction
    } else if (intent === 'generate') {
      numResults = 10; // Need more context for generation
      minScore = 0.25; // Lower threshold to get more info
    }
    
    // Expand query for better search results
    const expandedQuery = expandQuery(query, intent);
    
    // Search for relevant documents
    const searchResults = await searchDocuments(expandedQuery, numResults);
    
    // Filter by minimum score
    const filteredResults = searchResults.filter(r => r.score >= minScore);
    
    if (filteredResults.length === 0) {
      return {
        answer: "I don't have enough information to answer that question based on your personal data.",
        intent,
        format,
        confidence: 0,
        contextUsed: [],
        metadata: {
          searchResults: 0,
          avgRelevance: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }
    
    // For raw format extraction, try to extract directly from search results first
    // This avoids LLM hallucination for simple fields
    if (format === 'raw') {
      const directExtraction = extractDirectly(query, filteredResults);
      if (directExtraction) {
        const avgRelevance = filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length;
        return {
          answer: directExtraction,
          intent,
          format,
          confidence: Math.min(avgRelevance * 1.5, 1.0), // Higher confidence for direct extraction
          contextUsed: options.includeContext ? extractKeyFacts(filteredResults, 1) : [],
          metadata: {
            searchResults: filteredResults.length,
            avgRelevance,
            processingTime: Date.now() - startTime,
          },
        };
      }
    }
    
    // Build enhanced context
    const contextText = buildEnhancedContext(filteredResults, {
      maxResults: numResults,
      minScore,
      groupByCategory: intent === 'generate',
      includeMetadata: false,
      deduplicate: true,
    });
    
    // Build prompts
    const systemPrompt = buildSystemPrompt(intent, format, context);
    const userPrompt = buildUserPrompt(query, contextText, intent, context);
    
    // Generate response
    const rawResponse = await generateResponse(userPrompt, systemPrompt);
    
    // Validate and format
    const answer = validateResponse(rawResponse, format);
    
    // Calculate confidence based on search results
    const avgRelevance = filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length;
    const confidence = Math.min(avgRelevance * 1.2, 1.0); // Boost slightly, cap at 1.0
    
    // Extract context used
    const contextUsed = options.includeContext
      ? extractKeyFacts(filteredResults, 3)
      : [];
    
    return {
      answer,
      intent,
      format,
      confidence,
      contextUsed,
      metadata: {
        searchResults: filteredResults.length,
        avgRelevance,
        processingTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error('Error in smart RAG:', error);
    throw error;
  }
}

/**
 * Quick helpers for common use cases
 */

export async function quickExtract(fieldType: string): Promise<string> {
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
  
  const result = await smartRAG({
    query,
    intent: 'extract',
    format: 'raw',
    context: { fieldType },
  });
  
  return result.answer;
}

export async function quickQuestion(question: string): Promise<string> {
  const result = await smartRAG({
    query: question,
    intent: 'explain',
    format: 'paragraph',
  });
  
  return result.answer;
}

export async function quickGenerate(
  task: string,
  jobDescription?: string
): Promise<string> {
  const result = await smartRAG({
    query: task,
    intent: 'generate',
    format: 'essay',
    context: { jobDescription },
  });
  
  return result.answer;
}

export default {
  smartRAG,
  quickExtract,
  quickQuestion,
  quickGenerate,
};

