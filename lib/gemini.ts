import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// A list of models to fallback on if one is busy (503) or quota limited (429).
const MODELS_TO_TRY = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite"
];

/**
 * Helper to generate content with automatic fallbacks for 503/429 errors.
 */
async function generateContentWithFallback(requestData: any) {
  let lastError;
  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(requestData);
      return result;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // If it's a 503 service unavailable or 429 quota limit, we continue to the next model.
      if (error.message && (error.message.includes("503") || error.message.includes("429"))) {
        continue;
      }
      // If it's another error (like 400), just throw it.
      throw error;
    }
  }
  throw lastError;
}

/**
 * Analyzes an image of a civic issue.
 * @param base64Image The image in base64 format
 * @returns JSON with issueType, severity, confidence, and description
 */
export async function analyzeIssueImage(base64Image: string) {
  try {
    const prompt = `Analyze this image of a civic issue. Provide the output as a JSON object with the following keys:
- issueType (string): The type of issue (e.g., Pothole, Garbage, Broken Streetlight, etc.)
- severity (string): The severity of the issue (Low, Medium, High)
- confidence (number): Your confidence score from 0.0 to 1.0
- description (string): A brief description of the issue

Return ONLY valid JSON.`;

    // Strip the data URI prefix if it's there
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const result = await generateContentWithFallback([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const responseText = result.response.text();
    // Attempt to extract JSON from markdown formatting if present
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error analyzing issue image:", error);
    throw new Error("Failed to analyze image");
  }
}

/**
 * Generates a formal complaint letter.
 * @param name Name of the complainant
 * @param ward Ward number or area
 * @param issue Description of the issue
 * @returns Formatted letter text
 */
export async function generateComplaintLetter(name: string, ward: string, issue: string) {
  try {
    const prompt = `Write a formal complaint letter addressed to the municipal corporation regarding a civic issue.
Complainant Name: ${name}
Ward/Area: ${ward}
Issue Details: ${issue}

The letter should be professional, concise, and clear.`;

    const result = await generateContentWithFallback(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating complaint letter:", error);
    throw new Error("Failed to generate letter");
  }
}

/**
 * Predicts civic risks based on a summary of recent reports.
 * @param reportsSummary A textual summary of current reports
 * @returns An array of 3 prediction strings
 */
export async function predictCivicRisks(reportsSummary: string) {
  try {
    const prompt = `Based on these civic reports: ${reportsSummary}, 
predict which areas are at highest risk before monsoon season in India. 
Give exactly 3 specific predictions in simple English.
Format the output as a JSON array of 3 strings. Example: ["Prediction 1", "Prediction 2", "Prediction 3"]
Return ONLY valid JSON array.`;

    const result = await generateContentWithFallback(prompt);
    const responseText = result.response.text();
    // Attempt to extract JSON from markdown formatting if present
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error predicting civic risks:", error);
    return [
      "Unable to generate predictions at this time.",
      "Please check back later when more data is available.",
      "Ensure all areas maintain basic civic hygiene."
    ];
  }
}
