
import { Node, Edge } from "@xyflow/react";

export const DEMO_WORKFLOW = {
    name: "Product Marketing Kit Generator",
    description: "Generate a marketing kit from product images and videos using AI. (v5)",
    thumbnailUrl: "/Gemini_Generated_Image_qv9jw8qv9jw8qv9j.png",
    nodes: [
        // --- BRANCH A: IMAGE ---
        {
            id: "image-1",
            type: "image",
            position: { x: 0, y: 0 },
            data: {
                label: "Product Image",
                // Using a placeholder image that ends in .png/jpg to satisfy validation if needed, 
                // or a data URI. Using a placeholder URL for now.
                image: "/bluetoothheadphones-2048px-6141.webp"
            },
        },
        {
            id: "crop-1",
            type: "crop",
            position: { x: 300, y: 0 },
            data: {
                label: "Crop Image",
                x: 10, y: 10, width: 80, height: 80
            },
        },
        {
            id: "text-prompt-desc",
            type: "text",
            position: { x: 300, y: 200 },
            data: {
                label: "System Prompt",
                text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description."
            },
        },
        {
            id: "text-details",
            type: "text",
            position: { x: 300, y: 400 },
            data: {
                label: "Product Details",
                text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design."
            },
        },
        {
            id: "llm-1",
            type: "llm",
            position: { x: 600, y: 100 },
            data: {
                label: "Generate Description",
                // The output will be populated when run
            },
        },

        // --- BRANCH B: VIDEO ---
        {
            id: "video-1",
            type: "video",
            position: { x: 0, y: 600 },
            data: {
                label: "Product Video",
                video: "/WhatsApp Video 2026-02-06 at 9.54.48 PM.mp4"
            },
        },
        {
            id: "frame-1",
            type: "frame",
            position: { x: 300, y: 600 },
            data: {
                label: "Extract Frame",
                timestamp: 50, // 50%
                unit: "percentage"
            },
        },

        // --- CONVERGENCE ---
        {
            id: "text-prompt-social",
            type: "text",
            position: { x: 600, y: 500 },
            data: {
                label: "Social Media Prompt",
                text: "You are a Social Media Manager. Create a tweet-length marketing post based on the product description and the visual vibe."
            },
        },
        {
            id: "llm-2",
            type: "llm",
            position: { x: 900, y: 300 },
            data: {
                label: "Generate Social Post"
            },
        },
    ] as Node[],
    edges: [
        // Branch A
        // Image -> Crop (ImageNode Source is "output", CropNode Target is "image_url")
        { id: "e1", source: "image-1", target: "crop-1", sourceHandle: "output", targetHandle: "image_url" },

        // Crop -> LLM (CropNode Source is "output", LLM Target is "image")
        { id: "e2", source: "crop-1", target: "llm-1", sourceHandle: "output", targetHandle: "image" },

        // Text -> LLM (TextNode Source is "output", LLM Target is "system")
        { id: "e3", source: "text-prompt-desc", target: "llm-1", sourceHandle: "output", targetHandle: "system" },

        // Text -> LLM (TextNode Source is "output", LLM Target is "user")
        { id: "e4", source: "text-details", target: "llm-1", sourceHandle: "output", targetHandle: "user" },

        // Branch B
        // Video -> Frame (VideoNode Source is "output", FrameNode Target is "video_url")
        { id: "e5", source: "video-1", target: "frame-1", sourceHandle: "output", targetHandle: "video_url" },

        // Convergence to LLM 2
        // LLM #1 -> LLM #2 (LLM Source is "output", LLM Target is "user") - Feeding description as context
        { id: "e6", source: "llm-1", target: "llm-2", sourceHandle: "output", targetHandle: "user" },

        // Frame -> LLM #2 (Frame Source is "output", LLM Target is "image")
        { id: "e7", source: "frame-1", target: "llm-2", sourceHandle: "output", targetHandle: "image" },

        // Text -> LLM #2 (Text Source is "output", LLM Target is "system")
        { id: "e8", source: "text-prompt-social", target: "llm-2", sourceHandle: "output", targetHandle: "system" },

        // Additional User Request: Crop(1) -> LLM 2 Image (Note: LLM 2 already has Frame -> Image)
        // Connecting creating a second edge to the same target handle "image".
        { id: "e9", source: "crop-1", target: "llm-2", sourceHandle: "output", targetHandle: "image" },
    ] as Edge[],
};
