import { Router, Request, Response } from 'express';
import { smartRAG, quickExtract, quickQuestion, quickGenerate } from '../services/smartRAG';

const router = Router();

/**
 * POST /api/rag
 * 
 * ONE smart endpoint that handles ALL RAG use cases:
 * - Questions about personal info
 * - Form field extraction
 * - Cover letter generation
 * - Job application questions
 * - General chat
 * 
 * The AI automatically detects intent and formats the response appropriately.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query,
      intent,
      format,
      context,
      options,
    } = req.body;
    
    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Query is required',
        example: {
          query: 'What are my Node.js skills?',
          intent: 'explain',  // optional: extract, explain, generate, chat
          format: 'bullets',  // optional: short, bullets, paragraph, essay, raw
          context: {},        // optional: jobDescription, fieldType, etc.
        },
      });
      return;
    }
    
    const result = await smartRAG({
      query,
      intent,
      format,
      context,
      options,
    });
    
    res.json({
      success: true,
      query,
      answer: result.answer,
      intent: result.intent,
      format: result.format,
      confidence: result.confidence,
      contextUsed: result.contextUsed,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Error in smart RAG endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rag/extract
 * 
 * Quick helper for extracting specific fields
 * Useful for form filling
 */
router.post('/extract', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldType } = req.body;
    
    if (!fieldType) {
      res.status(400).json({
        success: false,
        error: 'fieldType is required',
        example: {
          fieldType: 'email',  // or: firstName, lastName, phone, etc.
        },
      });
      return;
    }
    
    const value = await quickExtract(fieldType);
    
    res.json({
      success: true,
      fieldType,
      value,
    });
  } catch (error) {
    console.error('Error in extract endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract field',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rag/ask
 * 
 * Quick helper for asking questions
 * Returns paragraph format by default
 */
router.post('/ask', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;
    
    if (!question) {
      res.status(400).json({
        success: false,
        error: 'question is required',
        example: {
          question: 'What are my top 3 technical skills?',
        },
      });
      return;
    }
    
    const answer = await quickQuestion(question);
    
    res.json({
      success: true,
      question,
      answer,
    });
  } catch (error) {
    console.error('Error in ask endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to answer question',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rag/generate
 * 
 * Quick helper for generating content
 * Useful for cover letters, essays, etc.
 */
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { task, jobDescription } = req.body;
    
    if (!task) {
      res.status(400).json({
        success: false,
        error: 'task is required',
        example: {
          task: 'Write a cover letter for this position',
          jobDescription: 'We are looking for a Full Stack Developer...',  // optional
        },
      });
      return;
    }
    
    const content = await quickGenerate(task, jobDescription);
    
    res.json({
      success: true,
      task,
      content,
    });
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

