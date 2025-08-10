const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

console.log('Environment Variables:');
console.log('----------------------');
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Check if the .env.local file exists and can be read
try {
  const envPath = path.resolve(__dirname, '.env.local');
  const exists = fs.existsSync(envPath);
  console.log('\nFile Check:');
  console.log('-----------');
  console.log(`.env.local exists: ${exists ? '✅ Yes' : '❌ No'}`);
  
  if (exists) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('\nFile Content:');
    console.log('-------------');
    console.log(content);
  }
} catch (error) {
  console.error('Error reading .env.local:', error);
}
