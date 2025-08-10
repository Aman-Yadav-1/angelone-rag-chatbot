const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. This will overwrite existing variables.');
  rl.question('Do you want to continue? (y/N) ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
    startSetup();
  });
} else {
  startSetup();
}

function startSetup() {
  console.log('\n🚀 Setting up environment variables for AngelOne RAG Chatbot\n');
  console.log('You will need:');
  console.log('1. An OpenAI API key (get it from https://platform.openai.com/api-keys)');
  console.log('2. ChromaDB URL (default: http://localhost:8000)\n');

  const envVars = {};

  rl.question('Enter your OpenAI API key: ', (openaiKey) => {
    envVars.OPENAI_API_KEY = openaiKey.trim();
    
    rl.question('Enter ChromaDB URL (press Enter for default http://localhost:8000): ', (chromaUrl) => {
      envVars.CHROMA_URL = chromaUrl.trim() || 'http://localhost:8000';
      
      // Generate .env.local content
      const envContent = `# Environment variables for AngelOne RAG Chatbot
# Generated on ${new Date().toISOString()}

# Required
OPENAI_API_KEY=${envVars.OPENAI_API_KEY}

# Optional - ChromaDB configuration
CHROMA_URL=${envVars.CHROMA_URL}\n`;

      // Write to .env.local
      fs.writeFileSync(envPath, envContent);
      
      console.log('\n✅ Successfully created .env.local');
      console.log('\nNext steps:');
      console.log('1. Start ChromaDB: docker run -p 8000:8000 chromadb/chroma');
      console.log('2. Process documents: npx ts-node scripts/process-docs.ts');
      console.log('3. Start the app: npm run dev\n');
      
      rl.close();
    });
  });
}
