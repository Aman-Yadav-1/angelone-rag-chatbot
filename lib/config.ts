export const config = {
  chroma: {
    collectionName: 'angelone_docs',
    url: process.env.CHROMA_URL || 'http://localhost:8000',
  },
  openai: {
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1000,
  },
  retrieval: {
    k: 4, // Number of documents to retrieve
    minScore: 0.7, // Minimum similarity score
  },
};
