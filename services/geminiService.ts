import { GoogleGenAI } from "@google/genai";
import { FileData } from '../types';

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

const getClient = () => {
    if (!API_KEY) {
        throw new Error("API Key is missing. Please check your environment variables.");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

const parseDocxToHtml = async (base64: string): Promise<string> => {
    // @ts-ignore
    if (typeof window.mammoth === 'undefined') {
        throw new Error("Mammoth library not loaded for DOCX conversion");
    }

    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // @ts-ignore
    const result = await window.mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
    return result.value;
};

export const convertDocToLatex = async (file: FileData, styleSample?: string): Promise<string> => {
    const client = getClient();
    const modelId = 'gemini-2.5-flash'; 
    
    let contentPart: any;
    let typeInstructions = "";

    if (file.type === 'application/pdf') {
        contentPart = {
            inlineData: {
                mimeType: file.type,
                data: file.base64
            }
        };
        typeInstructions = "The input is a PDF document.";
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Convert DOCX to HTML first using Mammoth (client-side) to preserve structure for the model
        const htmlContent = await parseDocxToHtml(file.base64);
        contentPart = {
            text: `Input Document Content (HTML format): \n${htmlContent}`
        };
        typeInstructions = "The input is the HTML representation of a DOCX file.";
    } else {
        throw new Error("Unsupported file type");
    }

    let prompt = `
      You are an expert LaTeX typesetter. 
      Please convert the attached document content into high-quality, well-structured LaTeX code.
      
      ${typeInstructions}

      Detailed Requirements:
      1. Use a standard preamble (article class) unless the style sample specifies otherwise.
      2. **Formatting**: accurately convert bold text (\\textbf), italic text (\\textit), lists (itemize/enumerate), and section headings.
      3. **Tables**: Convert tables to proper LaTeX 'tabular' environments, preserving columns and headers.
      4. **Math**: Detect mathematical expressions and convert them to LaTeX math mode ($...$ or \\[...\\]).
      5. Do not surround the output with markdown code fences (like \`\`\`latex). Just output the raw LaTeX code.
      6. If there are images, use placeholders like \\includegraphics[width=\\linewidth]{placeholder}.
    `;

    if (styleSample) {
        prompt += `
        
        **STYLE REFERENCE**:
        The user has provided a sample .tex file to define the desired styling, preamble, and package usage. 
        Please adhere to the formatting style found in the following code as closely as possible when generating the output:
        
        --- BEGIN STYLE SAMPLE ---
        ${styleSample}
        --- END STYLE SAMPLE ---
        `;
    }

    try {
        const response = await client.models.generateContent({
            model: modelId,
            contents: {
                parts: [
                    { text: prompt },
                    contentPart
                ]
            }
        });

        return response.text || "% No output generated.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to convert document.");
    }
};

export const convertLatexToDoc = async (latexCode: string): Promise<string> => {
    const client = getClient();
    const modelId = 'gemini-2.5-flash';

    const prompt = `
      You are a document conversion assistant. 
      Convert the following LaTeX code into a standalone, beautiful HTML5 document that looks like a printed paper.
      
      Requirements:
      1. Output **full HTML5** code (<html>, <head>, <body>).
      2. Use **internal CSS** (<style>) to style the document to look like a clean academic paper or professional document (e.g., Times New Roman font, max-width 800px, centered, proper line height).
      3. **Structure**: Correctly render \section as <h1>/<h2>, \textbf as <strong>, \textit as <em>, lists as <ul>/<ol>.
      4. **Tables**: Render LaTeX tables as HTML <table> with borders and padding.
      5. **Math**: If possible, assume the user might not have MathJax. Try to render simple math as text or unicode, but for complex math, leave it as LaTeX syntax or use simple HTML formatting where possible.
      6. Do not include markdown code fences (\`\`\`html). Output raw HTML only.
      
      LaTeX Input:
      ${latexCode}
    `;

    try {
        const response = await client.models.generateContent({
            model: modelId,
            contents: prompt,
        });

        return response.text || "No output generated.";
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw new Error(error.message || "Failed to convert LaTeX to document.");
    }
};