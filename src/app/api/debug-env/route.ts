import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || "NOT SET",
    hasClaudeKey: !!process.env.CLAUDE_API_KEY,
    claudePrefix: process.env.CLAUDE_API_KEY?.substring(0, 10) || "NOT SET",
    hasHunterKey: !!process.env.HUNTER_API_KEY,
    envFile: process.env.NODE_ENV,
  });
}
