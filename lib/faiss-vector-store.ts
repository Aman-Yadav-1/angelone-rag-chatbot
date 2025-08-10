import * as fs from 'fs/promises';
import * as path from 'path';
import { OpenAIEmbeddings } from '@langchain/openai';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';

const VECTOR_STORE_PATH = path.join(process.cwd(), 'faiss-store');
let vectorStore: FaissStore | null = null;

// Simple in-memory document store as a fallback
const memoryStore: Document[] = [];
let useMemoryStore = false;

async function initializeVectorStore() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not found, using in-memory store');
    useMemoryStore = true;
    return;
  }

  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    try {
      // Try to load existing store
      vectorStore = await FaissStore.load(VECTOR_STORE_PATH, embeddings);
    } catch (error) {
      // Create new store if none exists
      vectorStore = await FaissStore.fromDocuments([], embeddings);
      await vectorStore.save(VECTOR_STORE_PATH);
    }
  } catch (error) {
    console.error('Error initializing FAISS store, falling back to in-memory store:', error);
    useMemoryStore = true;
  }
}

export async function addDocumentsToStore(docs: Document[]) {
  if (useMemoryStore) {
    memoryStore.push(...docs);
    return;
  }

  if (!vectorStore) {
    await initializeVectorStore();
  }

  if (vectorStore) {
    await vectorStore.addDocuments(docs);
    await vectorStore.save(VECTOR_STORE_PATH);
  }
}

export async function queryDocuments(query: string, k = 4): Promise<Document[]> {
  if (useMemoryStore) {
    // Simple substring matching for in-memory store
    return memoryStore.filter(doc => 
      doc.pageContent.toLowerCase().includes(query.toLowerCase())
    ).slice(0, k);
  }

  if (!vectorStore) {
    await initializeVectorStore();
  }

  if (vectorStore) {
    return await vectorStore.similaritySearch(query, k);
  }

  return [];
}

// Initialize the store when this module is loaded
initializeVectorStore().catch(console.error);
// This file implements a vector store using FAISS for efficient similarity search.
// It provides functions to initialize the store, add documents, and query them.
