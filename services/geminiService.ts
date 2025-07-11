
import { GoogleGenAI } from "@google/genai";
import type { Part, Language } from "../types";

// IMPORTANT: This key is retrieved from environment variables.
// Do not hardcode API keys in the code.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to disable the feature or show a message.
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generatePartDescription = async (
    part: Pick<Part, 'partName' | 'sourceVehicleMake' | 'sourceVehicleModel' | 'sourceVehicleYear' | 'condition'>,
    lang: Language,
    t: (key: string) => string
    ): Promise<string> => {
  if (!API_KEY) {
    return t('gemini.apiKeyError');
  }

  const { partName, sourceVehicleMake, sourceVehicleModel, sourceVehicleYear, condition } = part;
  const languageName = { en: 'English', fr: 'French', ar: 'Arabic' }[lang];

  const prompt = `
    Generate a concise, professional, and appealing product description in ${languageName} for a used auto part.
    The description should be a single sentence or a very short paragraph.
    It should be suitable for an invoice or an online inventory listing.
    Do not use markdown or special formatting.

    Part Details:
    - Part Name: ${partName}
    - Vehicle: ${sourceVehicleMake} ${sourceVehicleModel}
    - Vehicle Year: ${sourceVehicleYear}
    - Condition: ${t(`conditions.${condition}`)}

    Example (if French): "Alternateur d'occasion en excellent état de fonctionnement, testé et garanti. Provenance: Volkswagen Golf IV 1.9 TDI de 2002."

    Generate a description for the provided part details:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
      }
    });

    const text = response.text;
    return text.trim();
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return t('gemini.generationError');
  }
};