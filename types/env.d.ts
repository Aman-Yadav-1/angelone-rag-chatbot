/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    OPENAI_API_KEY: string;
    CHROMA_URL?: string;
  }
}

declare module '*.pdf' {
  const content: string;
  export default content;
}

declare module '*.md' {
  const content: string;
  export default content;
}
