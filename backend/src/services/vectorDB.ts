import Database from 'better-sqlite3';
import * as sqlite_vss from 'sqlite-vss';
import path from 'path';
import { DataDocument, SearchResult } from '../types';
import { generateEmbedding } from './embeddings';

/**
 * Vector Database Service
 * 
 * SQLite + sqlite-vss implementation for semantic search
 * - Stores documents with 384-dimensional vector embeddings
 * - Fast similarity search using HNSW index
 * - 100% local and private
 */

const DB_PATH = path.join(__dirname, '../../../data/buddy.db');
const COLLECTION_NAME = 'manmit_context';

let db: Database.Database | null = null;

/**
 * Initialize SQLite database with vss extension
 */
export async function initDB(): Promise<Database.Database> {
  if (db) {
    return db;
  }

  console.log('🔄 Initializing SQLite database with vector search...');
  
  // Create database
  db = new Database(DB_PATH);
  
  // Load vss extension
  sqlite_vss.load(db);
  
  // Create documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      category TEXT,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  
  // Create vector search virtual table
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS documents_vss USING vss0(
      embedding(384)
    );
  `);
  
  console.log('✅ SQLite database initialized with vector search');
  console.log(`   Database: ${DB_PATH}`);
  
  return db;
}

/**
 * Get database instance (initialize if needed)
 */
async function getDB(): Promise<Database.Database> {
  if (!db) {
    await initDB();
  }
  return db!;
}

/**
 * Add documents to the vector database
 */
export async function addDocuments(docs: DataDocument[]): Promise<void> {
  try {
    const database = await getDB();
    
    console.log(`🔄 Adding ${docs.length} documents to vector DB...`);
    
    // Prepare statements
    const insertDoc = database.prepare(`
      INSERT OR REPLACE INTO documents (id, type, content, source, category, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertVector = database.prepare(`
      INSERT OR REPLACE INTO documents_vss (rowid, embedding)
      VALUES (?, ?)
    `);
    
    const getRowId = database.prepare(`
      SELECT rowid FROM documents WHERE id = ?
    `);
    
    // Process each document
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      
      // Generate embedding
      const embedding = await generateEmbedding(doc.content);
      
      // Insert document
      insertDoc.run(
        doc.id,
        doc.type,
        doc.content,
        doc.metadata.source,
        doc.metadata.category || null,
        JSON.stringify(doc.metadata.tags || []),
        doc.metadata.createdAt,
        doc.metadata.updatedAt
      );
      
      // Get rowid for the document
      const result = getRowId.get(doc.id) as { rowid: number };
      const rowid = result.rowid;
      
      // Insert vector
      insertVector.run(rowid, JSON.stringify(embedding));
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`   Progress: ${i + 1}/${docs.length} documents added`);
      }
    }
    
    console.log(`✅ Added ${docs.length} documents to vector DB`);
  } catch (error) {
    console.error('❌ Error adding documents to vector DB:', error);
    throw error;
  }
}

/**
 * Search for relevant documents using semantic similarity
 */
export async function searchDocuments(
  query: string,
  limit: number = 5,
  filter?: Record<string, any>
): Promise<SearchResult[]> {
  try {
    const database = await getDB();
    
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Build SQL query with optional filters
    // Note: vss_search requires LIMIT in the WHERE clause
    let sql = `
      SELECT 
        d.id,
        d.type,
        d.content,
        d.source,
        d.category,
        d.tags,
        vss.distance
      FROM documents_vss vss
      INNER JOIN documents d ON d.rowid = vss.rowid
      WHERE vss_search(
        vss.embedding,
        vss_search_params(?, ?)
      )
    `;
    
    // Add filters if provided
    const params: any[] = [JSON.stringify(queryEmbedding), limit];
    
    if (filter) {
      const conditions: string[] = [];
      
      if (filter.type) {
        conditions.push('d.type = ?');
        params.push(filter.type);
      }
      
      if (filter.category) {
        conditions.push('d.category = ?');
        params.push(filter.category);
      }
      
      if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
      }
    }
    
    // Execute search
    const results = database.prepare(sql).all(...params) as any[];
    
    // Convert to SearchResult format
    // sqlite-vss returns cosine distance (range: -1 to 1, lower is more similar)
    // For normalized vectors, distance is typically in range [0, 2]
    // Convert to similarity score (0-1, higher is better)
    return results.map(r => ({
      id: r.id,
      content: r.content,
      metadata: {
        source: r.source,
        category: r.category,
        tags: JSON.parse(r.tags || '[]'),
        type: r.type,
      },
      score: 1 / (1 + Math.abs(r.distance)), // Convert distance to similarity (0-1)
    }));
  } catch (error) {
    console.error('❌ Error searching vector DB:', error);
    throw error;
  }
}

/**
 * Get document by ID
 */
export async function getDocument(id: string): Promise<SearchResult | null> {
  try {
    const database = await getDB();
    
    const result = database.prepare(`
      SELECT id, type, content, source, category, tags
      FROM documents
      WHERE id = ?
    `).get(id) as any;
    
    if (!result) {
      return null;
    }
    
    return {
      id: result.id,
      content: result.content,
      metadata: {
        source: result.source,
        category: result.category,
        tags: JSON.parse(result.tags || '[]'),
        type: result.type,
      },
      score: 1.0,
    };
  } catch (error) {
    console.error('❌ Error getting document from vector DB:', error);
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDocument(document: DataDocument): Promise<void> {
  try {
    const database = await getDB();
    
    // Generate new embedding
    const embedding = await generateEmbedding(document.content);
    
    // Update document
    const updateDoc = database.prepare(`
      UPDATE documents
      SET type = ?, content = ?, source = ?, category = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `);
    
    updateDoc.run(
      document.type,
      document.content,
      document.metadata.source,
      document.metadata.category || null,
      JSON.stringify(document.metadata.tags || []),
      document.metadata.updatedAt,
      document.id
    );
    
    // Get rowid
    const result = database.prepare('SELECT rowid FROM documents WHERE id = ?').get(document.id) as { rowid: number };
    const rowid = result.rowid;
    
    // Update vector
    database.prepare(`
      UPDATE documents_vss
      SET embedding = ?
      WHERE rowid = ?
    `).run(JSON.stringify(embedding), rowid);
    
    console.log(`✅ Updated document ${document.id}`);
  } catch (error) {
    console.error('❌ Error updating document in vector DB:', error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    const database = await getDB();
    
    // Get rowid before deleting
    const result = database.prepare('SELECT rowid FROM documents WHERE id = ?').get(id) as { rowid: number } | undefined;
    
    if (!result) {
      console.warn(`⚠️  Document ${id} not found`);
      return;
    }
    
    const rowid = result.rowid;
    
    // Delete from documents table
    database.prepare('DELETE FROM documents WHERE id = ?').run(id);
    
    // Delete from vector table
    database.prepare('DELETE FROM documents_vss WHERE rowid = ?').run(rowid);
    
    console.log(`✅ Deleted document ${id}`);
  } catch (error) {
    console.error('❌ Error deleting document from vector DB:', error);
    throw error;
  }
}

/**
 * Delete all documents
 */
export async function clearAllDocuments(): Promise<void> {
  try {
    const database = await getDB();
    
    database.exec('DELETE FROM documents');
    database.exec('DELETE FROM documents_vss');
    
    console.log('✅ Cleared all documents from vector DB');
  } catch (error) {
    console.error('❌ Error clearing vector DB:', error);
    throw error;
  }
}

/**
 * Get collection stats
 */
export async function getStats(): Promise<{
  count: number;
  name: string;
  vectorCount: number;
}> {
  try {
    const database = await getDB();
    
    const docCount = database.prepare('SELECT COUNT(*) as count FROM documents').get() as { count: number };
    const vectorCount = database.prepare('SELECT COUNT(*) as count FROM documents_vss').get() as { count: number };
    
    return {
      count: docCount.count,
      vectorCount: vectorCount.count,
      name: COLLECTION_NAME,
    };
  } catch (error) {
    console.error('❌ Error getting vector DB stats:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
}

export default {
  initDB,
  addDocuments,
  searchDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  clearAllDocuments,
  getStats,
  closeDB,
};
