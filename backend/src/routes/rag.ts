import { Router, Request, Response } from 'express';
import {
  generateRAGResponse,
  answerPersonalQuestion,
  getFormFillData,
  generateCoverLetter,
  answerJobQuestion,
} from '../services/rag';

const router = Router();

/**
 * POST /api/rag/chat
 * Chat with context-aware RAG
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, numResults, filter, systemPrompt } = req.body;
    
    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message is required',
      });
      return;
    }
    
    const result = await generateRAGResponse(message, {
      numResults,
      filter,
      systemPrompt,
    });
    
    res.json({
      success: true,
      response: result.response,
      context: result.context,
    });
  } catch (error) {
    console.error('Error in RAG chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rag/question
 * Answer a personal question
 */
router.post('/question', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;
    
    if (!question) {
      res.status(400).json({
        success: false,
        error: 'Question is required',
      });
      return;
    }
    
    const answer = await answerPersonalQuestion(question);
    
    res.json({
      success: true,
      question,
      answer,
    });
  } catch (error) {
    console.error('Error in question endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to answer question',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rag/form-fill
 * Get data for form filling
 */
router.post('/form-fill', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldType } = req.body;
    
    if (!fieldType) {
      res.status(400).json({
        success: false,
        error: 'Field type is required',
      });
      return;
    }
    
    const data = await getFormFillData(fieldType);
    
    res.json({
      success: true,
      fieldType,
      data,
    });
  } catch (error) {
    console.error('Error in form-fill endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get form fill data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rag/cover-letter
 * Generate a cover letter
 */
router.post('/cover-letter', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      res.status(400).json({
        success: false,
        error: 'Job description is required',
      });
      return;
    }
    
    const coverLetter = await generateCoverLetter(jobDescription);
    
    res.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error('Error in cover-letter endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate cover letter',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rag/job-question
 * Answer a job application question
 */
router.post('/job-question', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, jobContext } = req.body;
    
    if (!question) {
      res.status(400).json({
        success: false,
        error: 'Question is required',
      });
      return;
    }
    
    const answer = await answerJobQuestion(question, jobContext);
    
    res.json({
      success: true,
      question,
      answer,
    });
  } catch (error) {
    console.error('Error in job-question endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to answer job question',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

