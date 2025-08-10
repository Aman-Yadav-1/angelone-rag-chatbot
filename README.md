# AngelOne RAG Chatbot

A Retrieval-Augmented Generation (RAG) chatbot for AngelOne support, built with Next.js, LangChain, and OpenRouter.

## Features

- **Document Retrieval**: Searches through AngelOne insurance PDFs
- **Context-Aware Responses**: Uses RAG to provide accurate, context-aware answers
- **Modern UI**: Clean, responsive chat interface
- **Vector Search**: Efficient semantic search using in-memory vector store
- **OpenRouter Integration**: Utilizes OpenRouter for LLM access

## Prerequisites

- Node.js 18+ and npm
- OpenRouter API key (get one at [OpenRouter](https://openrouter.ai/keys))

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angelone-rag-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Ingest documents**
   Open your browser and navigate to:
   ```
   http://localhost:3000/ingest
   ```
   Click the "Ingest Documents" button to process the insurance PDFs.

6. **Start chatting**
   After ingestion is complete, go to the home page to start chatting with the AI assistant.

## Project Structure

- `/app` - Next.js app router pages and API routes
  - `/api/chat` - Chat API endpoint
  - `/api/ingest` - Document ingestion endpoint
  - `/ingest` - Document ingestion UI
- `/lib` - Utility functions and vector store implementation
- `/Insurance PDFs` - Contains the insurance documents for processing

## How It Works

1. Documents are processed and split into chunks
2. Chunks are converted to embeddings and stored in memory
3. When a question is asked, relevant document chunks are retrieved
4. The retrieved context is used to generate an accurate response

## Notes

- The vector store is in-memory and will be cleared when the server restarts
- For production deployment, consider using a persistent vector database
- Make sure your OpenRouter account has sufficient credits for API usage

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to use the chatbot.

## Project Structure

- `app/` - Next.js app router pages and API routes
  - `api/chat/` - Chat API endpoint
  - `page.tsx` - Main chat interface
- `scripts/` - Utility scripts
  - `process-docs.ts` - Script to process and index documents
- `public/` - Static assets

## Deployment

### Vercel

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## License

MIT
