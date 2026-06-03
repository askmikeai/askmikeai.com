import { NextRequest } from "next/server";

// Ollama Cloud — hosted models via the native Ollama chat API.
// Docs: https://docs.ollama.com/cloud
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "https://ollama.com";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b";

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
    // The key is stored as OLLAMA_CLOUD; accept OLLAMA_API_KEY as an alias.
    const apiKey = process.env.OLLAMA_CLOUD || process.env.OLLAMA_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Chat is not configured",
          fallback: true,
          message:
            "Chat isn't connected yet. You can still describe your pain point and back the build below, or reach out to Mike directly.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = await request.json();

    const ollamaMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Ollama Cloud API error: ${response.status} ${detail}`);
    }

    // Ollama streams newline-delimited JSON (`{message:{content},done}`).
    // Re-emit it in the `data: {content}` / `data: [DONE]` shape the client expects.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // Keep the last (possibly partial) line for the next chunk.
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const json = JSON.parse(trimmed);
                if (json.message?.content) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content: json.message.content })}\n\n`
                    )
                  );
                }
                if (json.done) {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                }
              } catch {
                // Skip partial / non-JSON lines.
              }
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
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

    return new Response(
      JSON.stringify({
        error: "LLM service unavailable",
        fallback: true,
        message:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to contact Mike directly.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
