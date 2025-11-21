import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as pdfParse from 'pdf-parse';
import { DataDocument, PersonalInfo, ProfessionalInfo, Preferences } from '../types';
import { addDocuments, clearAllDocuments } from './vectorDB';

const DATA_DIR = path.join(__dirname, '../../../data');

/**
 * Read JSON file
 */
async function readJSON<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return null;
  }
}

/**
 * Parse PDF file
 */
async function parsePDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    // @ts-ignore - pdf-parse has type issues with default export
    const data = await pdfParse.default(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error);
    return '';
  }
}

/**
 * Chunk text into smaller pieces for better retrieval
 */
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep last part for overlap
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-Math.floor(overlap / 10)).join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 20); // Filter out very small chunks
}

/**
 * Load personal basic information
 */
async function loadPersonalBasic(): Promise<DataDocument[]> {
  const filePath = path.join(DATA_DIR, 'personal', 'basic.json');
  const data = await readJSON<PersonalInfo>(filePath);
  
  if (!data) return [];
  
  const documents: DataDocument[] = [];
  
  // Name document
  documents.push({
    id: uuidv4(),
    type: 'personal',
    content: `My name is ${data.name.full}. First name: ${data.name.first}, Last name: ${data.name.last}.`,
    metadata: {
      source: 'personal/basic.json',
      category: 'name',
      tags: ['name', 'identity'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  
  // Contact document
  documents.push({
    id: uuidv4(),
    type: 'personal',
    content: `My email is ${data.contact.email}. My phone number is ${data.contact.phone}. I live in ${data.contact.location.city}, ${data.contact.location.state}, ${data.contact.location.country}. My full address is: ${data.contact.location.address}${data.contact.location.zipCode ? ', ' + data.contact.location.zipCode : ''}.`,
    metadata: {
      source: 'personal/basic.json',
      category: 'contact',
      tags: ['email', 'phone', 'address', 'location'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  
  // Links document
  if (data.links.linkedin || data.links.github || data.links.portfolio) {
    const links: string[] = [];
    if (data.links.linkedin) links.push(`LinkedIn: ${data.links.linkedin}`);
    if (data.links.github) links.push(`GitHub: ${data.links.github}`);
    if (data.links.portfolio) links.push(`Portfolio: ${data.links.portfolio}`);
    if (data.links.twitter) links.push(`Twitter: ${data.links.twitter}`);
    
    documents.push({
      id: uuidv4(),
      type: 'personal',
      content: `My professional links: ${links.join(', ')}.`,
      metadata: {
        source: 'personal/basic.json',
        category: 'links',
        tags: ['linkedin', 'github', 'portfolio', 'social'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }
  
  // Legal document
  if (data.legal) {
    documents.push({
      id: uuidv4(),
      type: 'personal',
      content: `Citizenship: ${data.legal.citizenship}. Work authorization: ${data.legal.workAuthorization}. Requires sponsorship: ${data.legal.requiresSponsorship ? 'Yes' : 'No'}.`,
      metadata: {
        source: 'personal/basic.json',
        category: 'legal',
        tags: ['citizenship', 'work-authorization', 'visa'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }
  
  return documents;
}

/**
 * Load professional information
 */
async function loadProfessionalInfo(): Promise<DataDocument[]> {
  const filePath = path.join(DATA_DIR, 'personal', 'professional.json');
  const data = await readJSON<ProfessionalInfo>(filePath);
  
  if (!data) return [];
  
  const documents: DataDocument[] = [];
  
  // Title and summary
  documents.push({
    id: uuidv4(),
    type: 'professional',
    content: `I am a ${data.title}. ${data.summary}`,
    metadata: {
      source: 'personal/professional.json',
      category: 'summary',
      tags: ['title', 'summary', 'overview'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  
  // Experience
  for (const exp of data.experience) {
    const expText = `I worked at ${exp.company} as ${exp.title} from ${exp.startDate} to ${exp.endDate}. ${exp.description}. Key achievements: ${exp.achievements.join('; ')}. Technologies used: ${exp.technologies.join(', ')}.`;
    
    documents.push({
      id: uuidv4(),
      type: 'professional',
      content: expText,
      metadata: {
        source: 'personal/professional.json',
        category: 'experience',
        tags: ['work', 'experience', exp.company.toLowerCase(), ...exp.technologies.map(t => t.toLowerCase())],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }
  
  // Education
  for (const edu of data.education) {
    const eduText = `I studied ${edu.field} at ${edu.institution} and earned a ${edu.degree} in ${edu.graduationYear}${edu.gpa ? ` with a GPA of ${edu.gpa}` : ''}.`;
    
    documents.push({
      id: uuidv4(),
      type: 'professional',
      content: eduText,
      metadata: {
        source: 'personal/professional.json',
        category: 'education',
        tags: ['education', 'degree', edu.institution.toLowerCase()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }
  
  // Skills
  const allSkills = [
    ...data.skills.languages.map(s => `Programming language: ${s}`),
    ...data.skills.frontend.map(s => `Frontend technology: ${s}`),
    ...data.skills.backend.map(s => `Backend technology: ${s}`),
    ...data.skills.databases.map(s => `Database: ${s}`),
    ...data.skills.tools.map(s => `Tool: ${s}`),
    ...data.skills.soft.map(s => `Soft skill: ${s}`),
  ];
  
  documents.push({
    id: uuidv4(),
    type: 'skill',
    content: `My technical and professional skills: ${allSkills.join(', ')}.`,
    metadata: {
      source: 'personal/professional.json',
      category: 'skills',
      tags: ['skills', 'technologies', 'expertise'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  
  return documents;
}

/**
 * Load preferences
 */
async function loadPreferences(): Promise<DataDocument[]> {
  const filePath = path.join(DATA_DIR, 'personal', 'preferences.json');
  const data = await readJSON<Preferences>(filePath);
  
  if (!data) return [];
  
  const documents: DataDocument[] = [];
  
  // Job preferences
  documents.push({
    id: uuidv4(),
    type: 'preference',
    content: `Job preferences: I'm looking for roles as ${data.job.roles.join(' or ')}. Preferred locations: ${data.job.locations.join(', ')}. Job types: ${data.job.jobType.join(', ')}. Industries of interest: ${data.job.industries.join(', ')}. ${data.job.remote ? 'I prefer remote work.' : ''} ${data.job.salaryMin ? `Minimum salary expectation: $${data.job.salaryMin}.` : ''}`,
    metadata: {
      source: 'personal/preferences.json',
      category: 'job-preferences',
      tags: ['job', 'preferences', 'career'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  
  // Writing style
  documents.push({
    id: uuidv4(),
    type: 'preference',
    content: `Writing style preferences: Tone should be ${data.writing.tone}. Style should be ${data.writing.style}. Avoid: ${data.writing.avoid.join(', ')}.`,
    metadata: {
      source: 'personal/preferences.json',
      category: 'writing-style',
      tags: ['writing', 'style', 'communication'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  
  return documents;
}

/**
 * Load resume PDFs
 */
async function loadResumes(): Promise<DataDocument[]> {
  const resumesDir = path.join(DATA_DIR, 'resumes');
  const documents: DataDocument[] = [];
  
  try {
    const files = await fs.readdir(resumesDir);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    for (const file of pdfFiles) {
      const filePath = path.join(resumesDir, file);
      const text = await parsePDF(filePath);
      
      if (text) {
        // Chunk the resume text
        const chunks = chunkText(text, 500, 50);
        
        for (let i = 0; i < chunks.length; i++) {
          documents.push({
            id: uuidv4(),
            type: 'resume',
            content: chunks[i],
            metadata: {
              source: `resumes/${file}`,
              category: 'resume',
              tags: ['resume', 'cv', `chunk-${i + 1}`],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        }
      }
    }
  } catch (error) {
    console.log('No resumes folder or no PDF files found');
  }
  
  return documents;
}

/**
 * Ingest all data into vector database
 */
export async function ingestAllData(): Promise<{
  success: boolean;
  documentsAdded: number;
  error?: string;
}> {
  try {
    console.log('🔄 Starting data ingestion...');
    
    // Clear existing data
    await clearAllDocuments();
    
    // Load all data
    const personalDocs = await loadPersonalBasic();
    const professionalDocs = await loadProfessionalInfo();
    const preferenceDocs = await loadPreferences();
    const resumeDocs = await loadResumes();
    
    const allDocuments = [
      ...personalDocs,
      ...professionalDocs,
      ...preferenceDocs,
      ...resumeDocs,
    ];
    
    if (allDocuments.length === 0) {
      return {
        success: false,
        documentsAdded: 0,
        error: 'No documents found to ingest',
      };
    }
    
    // Add to vector database
    await addDocuments(allDocuments);
    
    console.log(`✅ Data ingestion complete! Added ${allDocuments.length} documents`);
    
    return {
      success: true,
      documentsAdded: allDocuments.length,
    };
  } catch (error) {
    console.error('Error during data ingestion:', error);
    return {
      success: false,
      documentsAdded: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default {
  ingestAllData,
};

