import { SearchResult } from '../types';

/**
 * Enhanced Context Builder
 * 
 * Builds intelligent context from search results with:
 * - Relevance scoring
 * - Deduplication
 * - Category grouping
 * - Metadata inclusion
 */

interface ContextOptions {
  maxResults?: number;
  minScore?: number;
  groupByCategory?: boolean;
  includeMetadata?: boolean;
  deduplicate?: boolean;
}

/**
 * Remove duplicate or highly similar content
 */
function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const unique: SearchResult[] = [];
  const seen = new Set<string>();
  
  for (const result of results) {
    // Create a normalized version for comparison
    const normalized = result.content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    
    // Skip if we've seen very similar content
    let isDuplicate = false;
    for (const seenContent of seen) {
      // Simple similarity check - if 80% of words overlap, consider duplicate
      const words1 = new Set(normalized.split(/\s+/));
      const words2 = new Set(seenContent.split(/\s+/));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const similarity = intersection.size / Math.min(words1.size, words2.size);
      
      if (similarity > 0.8) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      unique.push(result);
      seen.add(normalized);
    }
  }
  
  return unique;
}

/**
 * Group results by category for better organization
 */
function groupByCategory(results: SearchResult[]): Map<string, SearchResult[]> {
  const groups = new Map<string, SearchResult[]>();
  
  for (const result of results) {
    const category = result.metadata?.category || 'general';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(result);
  }
  
  return groups;
}

/**
 * Build enhanced context from search results
 */
export function buildEnhancedContext(
  results: SearchResult[],
  options: ContextOptions = {}
): string {
  const {
    maxResults = 10,
    minScore = 0.3,
    groupByCategory: shouldGroup = false,
    includeMetadata = true,
    deduplicate = true,
  } = options;
  
  if (results.length === 0) {
    return 'No relevant information found in your personal data.';
  }
  
  // Filter by minimum score
  let filtered = results.filter(r => r.score >= minScore);
  
  // Deduplicate if requested
  if (deduplicate) {
    filtered = deduplicateResults(filtered);
  }
  
  // Limit results
  filtered = filtered.slice(0, maxResults);
  
  // Build context
  if (shouldGroup) {
    return buildGroupedContext(filtered, includeMetadata);
  } else {
    return buildLinearContext(filtered, includeMetadata);
  }
}

/**
 * Build context with category grouping
 */
function buildGroupedContext(results: SearchResult[], includeMetadata: boolean): string {
  const groups = groupByCategory(results);
  const contextParts: string[] = [];
  
  // Priority order for categories
  const categoryOrder = ['summary', 'skills', 'experience', 'education', 'contact', 'links', 'preferences'];
  
  // Sort categories by priority
  const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  for (const category of sortedCategories) {
    const categoryResults = groups.get(category)!;
    contextParts.push(`\n## ${category.toUpperCase()}`);
    
    for (const result of categoryResults) {
      if (includeMetadata) {
        contextParts.push(
          `[Score: ${result.score.toFixed(2)} | Source: ${result.metadata?.source || 'unknown'}]\n${result.content}`
        );
      } else {
        contextParts.push(result.content);
      }
    }
  }
  
  return contextParts.join('\n\n');
}

/**
 * Build context in linear format (ranked by relevance)
 */
function buildLinearContext(results: SearchResult[], includeMetadata: boolean): string {
  const contextParts: string[] = [];
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    
    if (includeMetadata) {
      contextParts.push(
        `[${i + 1}] (Relevance: ${(result.score * 100).toFixed(0)}% | ${result.metadata?.category || 'general'})\n${result.content}`
      );
    } else {
      contextParts.push(`[${i + 1}] ${result.content}`);
    }
  }
  
  return contextParts.join('\n\n');
}

/**
 * Build context summary for quick overview
 */
export function buildContextSummary(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant information found.';
  }
  
  const categories = new Set(results.map(r => r.metadata?.category).filter(Boolean));
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  return `Found ${results.length} relevant documents across ${categories.size} categories (avg relevance: ${(avgScore * 100).toFixed(0)}%)`;
}

/**
 * Extract key facts from context
 */
export function extractKeyFacts(results: SearchResult[], limit: number = 5): string[] {
  const facts: string[] = [];
  
  // Sort by score
  const sorted = [...results].sort((a, b) => b.score - a.score);
  
  for (const result of sorted.slice(0, limit)) {
    // Extract first sentence or key information
    const sentences = result.content.split(/[.!?]\s+/);
    if (sentences.length > 0 && sentences[0].length < 200) {
      facts.push(sentences[0].trim());
    } else {
      // If first sentence is too long, take first 150 chars
      facts.push(result.content.substring(0, 150).trim() + '...');
    }
  }
  
  return facts;
}

export default {
  buildEnhancedContext,
  buildContextSummary,
  extractKeyFacts,
};

