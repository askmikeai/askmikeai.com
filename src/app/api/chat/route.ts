import { NextRequest } from "next/server";

// Ollama Cloud — hosted models via the native Ollama chat API.
// Docs: https://docs.ollama.com/cloud
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "https://ollama.com";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b";

// Fields the bot must collect before the pledge button unlocks (kept in sync
// with REQUIRED_FIELDS in src/app/page.tsx). Price comes from the slider.
const PROFILE_FIELDS = [
  "name",
  "email",
  "company",
  "role",
  "problem",
  "frequency",
  "cost",
] as const;

const SYSTEM_PROMPT = `You are Mike's assistant on AskMikeAI. Mike is a builder, educator, and active member of the AI community. He is NOT a consultant — he ships real software. His next product will come from a real problem that's genuinely costing a real person time, money, or sleep.

Your job is a friendly **product-validation interview**. Warmly help the visitor articulate their pain point AND gather the details Mike needs to decide what to build. You must collect ALL of the following, conversationally — one or two questions at a time, never as a form:

1. **problem** — the core pain point, in their own words.
2. **frequency** — how often it happens (daily? weekly? every project?).
3. **cost** — what it costs them: hours per week, dollars, or stress/sleep.
4. **name** — their first name.
5. **email** — the best email to reach them.
6. **company** — where they work (or "solo/personal" if independent).
7. **role** — their role or title.

Guidelines:
- Be empathetic and curious. Acknowledge the frustration before digging in. React to their answers like a human would.
- Ask in a natural order: start with the problem and its impact, then get their details so Mike can follow up. Don't dump all questions at once.
- Once you have ALL seven, confirm briefly and tell them they can now **set their price on the slider and back the build** — verifying their email and booking a Zoom with Mike is the last step.
- Never invent credentials, case studies, clients, or stats about Mike. If you don't know something, say so.
- Use markdown (bold, short bullets). Keep replies concise.`;

const EXTRACT_SYSTEM = `You are a strict data-extraction function. From the conversation, extract what THE VISITOR has explicitly shared. Return ONLY a JSON object with exactly these string keys: "name", "email", "company", "role", "problem", "frequency", "cost".
- "problem": the core pain point in one sentence.
- "frequency": how often the problem happens.
- "cost": what it costs them (time, money, or stress).
- Use the visitor's own information only. If a field has not been clearly provided yet, set it to an empty string "".
- Do NOT guess, infer, or invent values. Output JSON only — no prose.`;

type Msg = { role: string; content: string };

/** Run a non-streaming JSON extraction over the conversation. Best-effort. */
async function extractProfile(
  convo: Msg[],
  apiKey: string
): Promise<Record<string, string> | null> {
  try {
    // Flatten to a transcript in ONE user message — passing role-tagged turns
    // makes the model continue the chat instead of extracting.
    const transcript = convo
      .map((m) => `${m.role === "assistant" ? "Assistant" : "Visitor"}: ${m.content}`)
      .join("\n\n");
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: EXTRACT_SYSTEM },
          {
            role: "user",
            content: `Conversation so far:\n\n${transcript}\n\nExtract the visitor's details as JSON.`,
          },
        ],
        stream: false,
        format: "json",
        // gpt-oss is a reasoning model — disable thinking so content is pure JSON.
        think: false,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = String(data.message?.content || "{}");
    // Defensive: isolate the JSON object even if any prose/reasoning leaks in.
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const jsonText = start !== -1 && end !== -1 ? raw.slice(start, end + 1) : raw;
    const parsed = JSON.parse(jsonText);
    const profile: Record<string, string> = {};
    for (const key of PROFILE_FIELDS) {
      const v = parsed[key];
      profile[key] = typeof v === "string" ? v.trim() : "";
    }
    return profile;
  } catch (error) {
    console.error("extractProfile failed:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { messages } = (await request.json()) as { messages: Msg[] };

    const ollamaMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
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
    // Re-emit as `data: {content}` for the client, then after the reply
    // completes, extract the validation profile and emit `data: {profile}`.
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
        let assistantReply = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const json = JSON.parse(trimmed);
                if (json.message?.content) {
                  assistantReply += json.message.content;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content: json.message.content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip partial / non-JSON lines.
              }
            }
          }

          // Extract the running profile from the full conversation so the
          // client can decide whether to unlock the pledge button.
          const convo = [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "assistant", content: assistantReply },
          ];
          const profile = await extractProfile(convo, apiKey);
          if (profile) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ profile })}\n\n`)
            );
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
