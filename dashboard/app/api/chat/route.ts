import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Read context files to make the API context aware
    const csvPath = path.join(process.cwd(), '..', 'dashboard_data.csv');
    const readmePath = path.join(process.cwd(), '..', 'data-README.md');
    const jsonPath = path.join(process.cwd(), 'lib', 'data.json');
    
    let contextStr = 'Context is unavailable.';
    try {
      const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '';
      
      let jsonSummary = '';
      if (fs.existsSync(jsonPath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        // Remove scatter_data to save payload size, as the summary stats are what matters
        delete jsonData.scatter_data;
        jsonSummary = JSON.stringify(jsonData, null, 2);
      }
      
      // Read a large chunk of the CSV to give it access to the raw data
      const csvData = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, 'utf8').substring(0, 50000) : '';

      contextStr = `
You are an expert AI data scientist and assistant for the UC Admissions dashboard. 
You have context of the entire site, the metrics being displayed, and the raw data.
Use your Google Search tool if the user asks for up-to-date real-world context outside the data.

### SITE DATA SUMMARY (Calculated Stats)
${jsonSummary}

### DATA README (Context on the dataset)
${readme}

### RAW CSV DATA (Sample of the first ~500k chars)
${csvData}
      `;
    } catch (e) {
      console.error('Failed to read context files:', e);
    }

    // Convert chat history into the format Gemini expects
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        contents,
        systemInstruction: {
          parts: [{ text: contextStr }]
        },
        tools: [
          { googleSearch: {} }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Failed to generate response: ${response.statusText}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
