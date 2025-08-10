// Simple test script to check environment variables
console.log('Environment Variables:');
console.log('----------------------');
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Try to load .env file directly
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('\nContents of .env.local:');
  console.log('----------------------');
  console.log(fs.readFileSync(envPath, 'utf8'));
} else {
  console.log('\n⚠️  .env.local file not found');
}
