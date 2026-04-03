import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an elite running and fitness coach for the app "SweatStats". You give concise, actionable, and encouraging advice. Prefer practical steps the user can do this week. Be safety-aware (injury, overtraining). Use metric or imperial to match the user; default to metric. Keep replies focused—avoid long essays unless the user asks for depth.`;

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

function sseData(payload: unknown): Uint8Array {
  const line = `data: ${JSON.stringify(payload)}\n\n`;
  return new TextEncoder().encode(line);
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "Set GROQ_API_KEY in .env.local (https://console.groq.com/keys)." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (body as { messages?: { role: string; content: string }[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages[] required" }, { status: 400 });
  }

  const model =
    process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";

  
  const client = new OpenAI({
    apiKey: apiKey, 
    baseURL: "https://api.groq.com/openai/v1",
  });

  const chatMessages = messages.map((m) => ({
    role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
    content: String(m.content).slice(0, 12000),
  }));

  let stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
  try {
    stream = await client.chat.completions.create({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatMessages],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });
  } catch (e) {
    console.error("Groq coach error", e);
    return Response.json({ error: "Failed to start coach stream." }, { status: 502 });
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(sseData({ text }));
          }
        }
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      } catch (e) {
        controller.enqueue(sseData({ error: e instanceof Error ? e.message : "Stream error" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
