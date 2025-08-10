import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';

// Simple in-memory store
const store: {
  documents: Document[];
  embeddings: any;
} = {
  documents: [],
  embeddings: null
};

// Simple in-memory vector store implementation
export async function getVectorStore() {
  if (!store.embeddings) {
    console.log('Initializing embeddings...');
    
    try {
      // Create embeddings instance
      store.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENROUTER_API_KEY,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
        },
      });
      
      console.log('Embeddings initialized successfully');
    } catch (error) {
      console.error('Error initializing embeddings:', error);
      throw error;
    }
  }
  
  return store;
}

export async function addDocuments(docs: Document[]): Promise<number> {
  if (!docs || docs.length === 0) {
    console.warn('No documents to add to store');
    return 0;
  }

  // Filter out any invalid documents
  const validDocs = docs.filter(doc => {
    const isValid = doc && 
                   doc.pageContent && 
                   typeof doc.pageContent === 'string' && 
                   doc.pageContent.trim().length > 0;
    
    if (!isValid) {
      console.warn('Skipping invalid document:', doc);
    }
    
    return isValid;
  });

  if (validDocs.length === 0) {
    console.warn('No valid documents to add after filtering');
    return 0;
  }

  console.log(`Adding ${validDocs.length} documents to store...`);
  
  try {
    const store = await getVectorStore();
    
    // Add documents to our in-memory store
    store.documents.push(...validDocs);
    
    console.log(`✅ Successfully added ${validDocs.length} documents to store`);
    return validDocs.length;
    
  } catch (error) {
    console.error('Error in addDocuments:', error);
    throw error;
  }
}

export async function queryDocuments(query: string, k = 4): Promise<Document[]> {
  try {
    console.log(`Querying documents for: "${query}"`);
    
    const store = await getVectorStore();
    
    if (!store.embeddings) {
      console.error('Embeddings not initialized');
      return [];
    }
    
    // Simple text-based search as a fallback
    // In a real implementation, you'd use embeddings for semantic search
    const queryLower = query.toLowerCase();
    const results = store.documents
      .filter(doc => doc.pageContent.toLowerCase().includes(queryLower))
      .slice(0, k);
    
    console.log(`Found ${results.length} relevant documents`);
    
    return results;
  } catch (error) {
    console.error('Error querying documents:', error);
    return [];
  }
}

export async function getDocumentCount(): Promise<number> {
  try {
    const store = await getVectorStore();
    return store.documents.length;
  } catch (error) {
    console.error('Error getting document count:', error);
    return 0;
  }
}
