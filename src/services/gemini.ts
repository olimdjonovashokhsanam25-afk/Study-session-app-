import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processStudyMaterial(content: string, type: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following study material (${type}):
    "${content}"
    
    Please provide:
    1. A concise summary.
    2. 5 challenging study questions.
    3. 5 effective flashcards (front and back).
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        },
        required: ["summary", "questions", "flashcards"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
