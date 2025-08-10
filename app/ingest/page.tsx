'use client';

import { useState } from 'react';

export default function IngestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIngest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ingest');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to ingest documents');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error ingesting documents:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Ingestion</h1>
          <p className="text-gray-600">
            Click the button below to process and ingest the insurance documents into the vector store.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <button
            onClick={handleIngest}
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? 'Processing...' : 'Ingest Documents'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingestion Results</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm text-gray-800 overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Documents have been successfully processed and added to the vector store.
                You can now use the chat interface to ask questions about the insurance documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
