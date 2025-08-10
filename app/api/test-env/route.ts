import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openRouterKey: !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    openAIKey: !!process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env)
      .filter(k => k.includes('OPEN') || k.includes('NODE'))
      .reduce((acc, key) => ({
        ...acc,
        [key]: key.includes('KEY') ? '***REDACTED***' : process.env[key]
      }), {})
  });
}
