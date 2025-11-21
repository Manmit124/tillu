import { Router, Request, Response } from 'express';
import { ingestAllData } from '../services/dataManager';
import { getStats } from '../services/vectorDB';

const router = Router();

/**
 * POST /api/data/ingest
 * Ingest all personal data into vector database
 */
router.post('/ingest', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await ingestAllData();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Data ingestion complete',
        documentsAdded: result.documentsAdded,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Data ingestion failed',
      });
    }
  } catch (error) {
    console.error('Error in data ingest endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ingest data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/data/stats
 * Get vector database statistics
 */
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getStats();
    
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error in data stats endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

