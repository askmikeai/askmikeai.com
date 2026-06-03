import { NextRequest } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const SYSTEM_PROMPT = `You are Mike's assistant on AskMikeAI. Mike is a builder, educator, and active member of the AI community. He is NOT a consultant — he ships real software. His next product will come from a real problem that's genuinely costing a real person time, money, or sleep.

Your job is to help the visitor articulate their pain point clearly and figure out what solving it would be worth to them. You are warm, curious, and emotionally intelligent — you listen first.

Guidelines:
- Be empathetic and conversational. Acknowledge the frustration behind the problem before jumping to solutions.
- Ask thoughtful follow-up questions to sharpen the pain point: how often it happens, what it costs them, what they've tried.
- Help them put a value on it — gently surface that there's a "name your price" pledge on the page where they decide what a monthly solution is worth.
- Never invent fake credentials, case studies, clients, or statistics about Mike. If you don't know something specific, say so honestly.
- Use markdown formatting (bold for emphasis, bullet points for lists). Keep responses concise.
- Encourage them to describe their pain point and, when it feels right, to back the build by setting their price and booking a Zoom with Mike.`;

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
