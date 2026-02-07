import { task, logger } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateContent = task({
    id: "generate-content",
    // Set an optional maxDuration to prevent the task from running indefinitely
    maxDuration: 300,
    run: async (payload: { systemPrompt?: string; userPrompt: string; image?: string }, { ctx }) => {
        logger.log("Starting Gemini generation task", { payload });

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY is missing from environment variables!");
        }

        // Initialize Gemini inside the task to ensure it reads the latest Env Var
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const parts: any[] = [];

        // Add Image if present
        if (payload.image) {
            // Base64 handling: remove prefix if present (data:image/xyz;base64,)
            const base64Data = payload.image.includes(",")
                ? payload.image.split(",")[1]
                : payload.image;

            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/png", // Ideally detect this, but defaulting for MVP
                }
            });
        }

        // Construct Prompt
        let fullPrompt = payload.userPrompt;
        if (payload.systemPrompt) {
            // Prepending system prompt as part of the text
            fullPrompt = `System Instructions: ${payload.systemPrompt}\n\nUser Request: ${payload.userPrompt}`;
        }
        parts.push({ text: fullPrompt });

        try {
            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            logger.log("Generation complete", { text });

            return {
                text,
            };
        } catch (error) {
            logger.error("Gemini generation failed", { error });
            throw error;
        }
    },
});
