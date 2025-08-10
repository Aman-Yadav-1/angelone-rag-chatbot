import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import fs from 'fs';
import path from 'path';

const VECTOR_STORE_PATH = path.join(process.cwd(), 'vector-store');

async function getVectorStore() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Try to load existing vector store
    return await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
  } catch (e) {
    // If no vector store exists, create a new empty one
    console.log('Creating new vector store...');
    return HNSWLib.fromDocuments([], embeddings);
  }
}

async function saveVectorStore(store: HNSWLib) {
  await store.save(VECTOR_STORE_PATH);
}

async function addDocumentsToStore(docs: Document[]) {
  const store = await getVectorStore();
  await store.addDocuments(docs);
  await saveVectorStore(store);
  return store;
}

async function queryDocuments(query: string, k = 4) {
  const store = await getVectorStore();
  return store.similaritySearch(query, k);
}

module.exports = {
  getVectorStore,
  saveVectorStore,
  addDocumentsToStore,
  queryDocuments
};
