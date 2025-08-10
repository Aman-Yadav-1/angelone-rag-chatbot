import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as fs from 'fs/promises';
import * as path from 'path';
import { addDocumentsToStore } from '../lib/faiss-vector-store';
import { Document } from 'langchain/document';

async function loadAndSplitDocuments(directory: string): Promise<Document[]> {
  try {
    const files = await fs.readdir(directory);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.warn('No PDF files found in directory:', directory);
      return [];
    }

    const allDocs: Document[] = [];
    
    for (const file of pdfFiles) {
      const filePath = path.join(directory, file);
      console.log(`Processing file: ${filePath}`);
      
      try {
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
            source: filePath,
          },
        }));
        
        allDocs.push(...docsWithMetadata);
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }
    
    return allDocs;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

async function addDocuments(documents: Document[]) {
  if (documents.length === 0) {
    throw new Error('No documents to process');
  }

  console.log(`Adding ${documents.length} document chunks to vector store...`);
  
  try {
    await addDocumentsToStore(documents);
    console.log('✅ Successfully added documents to vector store');
  } catch (error) {
    console.error('❌ Error adding documents to vector store:', error);
    throw error;
  }
}

async function main() {
  try {
    const docsDir = path.join(process.cwd(), 'docs');
    console.log('Loading documents from:', docsDir);
    
    const docs = await loadAndSplitDocuments(docsDir);
    console.log(`Processed ${docs.length} document chunks`);
    // Process PDFs from the Insurance PDFs directory
    const pdfDir = path.join(process.cwd(), '..', 'Insurance PDFs');
    const documents = await loadAndSplitDocuments(pdfDir);
    
    if (documents.length === 0) {
      console.warn('No documents were processed. Please check your input directory.');
      return;
    }
    
    // Add documents to the vector store
    await addDocuments(documents);
    
    console.log('\n✅ Successfully processed', documents.length, 'document chunks');
    console.log('You can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ An error occurred during document processing:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
