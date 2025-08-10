import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { addDocuments } from '@/lib/vector-store';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';

async function loadAndProcessDocuments() {
  // Path to the directory containing the PDFs
  const docsPath = path.join(process.cwd(), 'public', 'insurance-pdfs');
  
  // First, check what files are actually in the directory
  let files: string[] = [];
  try {
    files = await fs.readdir(docsPath);
    console.log('Found files in directory:', files);
  } catch (error) {
    console.error(`Error reading directory ${docsPath}:`, error);
    throw new Error(`Could not read PDF directory at: ${docsPath}`);
  }
  
  // Filter for PDF files only for now
  const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
  
  if (pdfFiles.length === 0) {
    console.error('No PDF files found in directory:', docsPath);
    throw new Error('No PDF files found in the specified directory');
  }

  const allDocs: Document[] = [];
  
  // First, check if the directory exists
  try {
    await fs.access(docsPath);
  } catch (error) {
    console.error(`Directory not found: ${docsPath}`);
    throw new Error(`PDF directory not found at: ${docsPath}`);
  }
  
  for (const file of pdfFiles) {
    const filePath = path.join(docsPath, file);
    console.log(`Processing PDF file: ${filePath}`);
    
    try {
      // Check if file exists
      await fs.access(filePath);
      
      const loader = new PDFLoader(filePath);
      
      const docs = await loader.load();
      
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const splitDocs = await splitter.splitDocuments(docs);
      
      // Add metadata about the source file
      const docsWithMetadata = splitDocs.map(doc => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          source: file,
        },
      }));
      
      allDocs.push(...docsWithMetadata);
      console.log(`✅ Processed ${splitDocs.length} chunks from ${file}`);
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error);
      // Continue with other files even if one fails
      continue;
    }
  }
  
  return allDocs;
}

export async function GET() {
  try {
    const documents = await loadAndProcessDocuments();
    
    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents were processed' },
        { status: 500 }
      );
    }
    
    // Process documents in smaller batches
    const BATCH_SIZE = 10;
    let processedCount = 0;
    const uniqueSources = new Set<string>();
    
    try {
      console.log(`Processing ${documents.length} documents in batches of ${BATCH_SIZE}...`);
      
      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
        
        const addedCount = await addDocuments(batch);
        if (addedCount) {
          processedCount += addedCount;
          // Track unique sources
          batch.forEach(doc => {
            if (doc.metadata?.source) {
              uniqueSources.add(doc.metadata.source);
            }
          });
        }
      }
      
      if (processedCount === 0) {
        throw new Error('No documents were successfully added to the vector store');
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully processed and indexed ${processedCount} document chunks`,
        documentCount: processedCount,
        files: Array.from(uniqueSources)
      });
      
    } catch (error: unknown) {
      console.error('Error in document ingestion:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to process documents',
          processedCount,
          details: process.env.NODE_ENV === 'development' 
            ? error instanceof Error ? error.message : String(error)
            : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in document ingestion:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process documents',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error)
          : undefined
      },
      { status: 500 }
    );
  }
}
