import { Router, Request, Response } from 'express';
import { searchDocuments } from '../services/vectorDB';

const router = Router();

/**
 * POST /api/search
 * Search for relevant documents in vector database
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, limit = 5, filter } = req.body;
    
    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Query is required',
      });
      return;
    }
    
    const results = await searchDocuments(query, limit, filter);
    
    res.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error in search endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

