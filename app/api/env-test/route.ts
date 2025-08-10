import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openaiKey: process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing',
    nodeEnv: process.env.NODE_ENV || 'development',
    // Don't expose the actual key in the response
    isKeyConfigured: !!process.env.OPENAI_API_KEY,
  });
}
