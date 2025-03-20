import { NextResponse } from 'next/server';

export async function GET() {
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY); // Debugging

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    return NextResponse.json({ key: process.env.OPENAI_API_KEY }, { status: 200 });
}
