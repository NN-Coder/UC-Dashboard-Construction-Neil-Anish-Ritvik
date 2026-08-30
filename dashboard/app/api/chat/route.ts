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
    const csvPath = path.join(process.cwd(), 'data', 'dashboard_data.csv');
    const readmePath = path.join(process.cwd(), 'data', 'data-README.md');
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
      
      contextStr = `
You are an expert AI data scientist and assistant for the UC Admissions dashboard. 
You have context of the entire site and the metrics being displayed.
You also have access to a secure Python execution sandbox! 

When the user asks for a chart, distribution, or visualization:
1. Write Python code using pandas and matplotlib to generate the chart.
2. Since you cannot directly mount the 12MB CSV file in this isolated sandbox yet, use the SITE DATA SUMMARY below to reconstruct an accurate pandas DataFrame containing the requested data, or generate a statistically accurate synthetic distribution based on the exact regression slopes and correlations provided.
3. Save or display the plot. The sandbox will automatically capture the matplotlib figure and return it to the user.

### SITE DATA SUMMARY (Calculated Stats)
${jsonSummary}

### DATA README (Context on the dataset)
${readme}
      `;
    } catch (e) {
      console.error('Failed to read context files:', e);
    }

    // Convert chat history into the format Gemini expects
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Ensure we are using the gemini-1.5-pro model since code execution is more robust there, but we will stick to 3.5-flash as requested.
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
          { codeExecution: {} }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Failed to generate response: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response parts to extract text and any generated images from code execution
    let replyText = "";
    const images: string[] = [];
    const parts = data.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if (part.text) {
        replyText += part.text + "\n";
      } else if (part.executableCode) {
        replyText += `\n\`\`\`python\n${part.executableCode.code}\n\`\`\`\n`;
      } else if (part.codeExecutionResult) {
        if (part.codeExecutionResult.output) {
          replyText += `\n**Execution Output:**\n\`\`\`\n${part.codeExecutionResult.output}\n\`\`\`\n`;
        }
      } else if (part.inlineData) {
        // If the code execution generated an image, add it to the images array
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        // Also keep it inline for the chatbot window
        replyText += `\n![Generated Chart](data:${part.inlineData.mimeType};base64,${part.inlineData.data})\n`;
      }
    }
    
    if (!replyText) replyText = "I couldn't generate a response.";

    return NextResponse.json({ reply: replyText.trim(), images });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
