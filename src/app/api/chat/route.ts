import { NextRequest } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const SYSTEM_PROMPT = `You are AskMikeAI, a friendly and knowledgeable AI assistant for a Miami-based AI consulting company. Your role is to help potential clients understand how AI can transform their business.

Key services you can discuss:
1. AI Strategy Consulting - Developing comprehensive AI roadmaps tailored to business goals
2. Custom AI Solutions - Building bespoke AI applications (chatbots, document processing, predictive analytics)
3. AI Training & Workshops - Empowering teams with hands-on AI training for all skill levels

Guidelines:
- Be warm, professional, and conversational
- Use markdown formatting for better readability (bold for emphasis, bullet points for lists)
- Keep responses concise but informative
- Encourage scheduling a consultation for detailed discussions
- If asked about pricing, suggest they contact directly for a custom quote
- Highlight the Miami location and personalized service approach`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Build the messages array for Ollama
    const ollamaMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call Ollama API with streaming
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  // Send the content as a server-sent event
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: json.message.content })}\n\n`)
                  );
                }
                if (json.done) {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Fallback response if Ollama is not available
    return new Response(
      JSON.stringify({
        error: "LLM service unavailable",
        fallback: true,
        message:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to contact us directly for assistance.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
