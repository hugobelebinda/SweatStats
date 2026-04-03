"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function CoachPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m Coach Dash for SweatStats. Ask about pacing, recovery, or race prep. (Powered by Groq.)",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    setErr(null);

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setPending(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(data.error ?? `Request failed (${res.status})`);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (!res.body) {
        setErr("No response body");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const appendToken = (token: string) => {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: last.content + token };
          }
          return copy;
        });
        queueMicrotask(() =>
          bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        );
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const block of parts) {
          const line = block.trim();
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string };
            if (parsed.error) {
              setErr(parsed.error);
              continue;
            }
            if (parsed.text) {
              appendToken(parsed.text);
            }
          } catch {
            /* ignore partial JSON */
          }
        }
      }

      if (buffer.trim()) {
        const line = buffer.trim();
        if (line.startsWith("data: ")) {
          const payload = line.slice(6).trim();
          if (payload && payload !== "[DONE]") {
            try {
              const parsed = JSON.parse(payload) as { text?: string };
              if (parsed.text) appendToken(parsed.text);
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch {
      setErr("Network error");
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setPending(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-marine dark:text-white">Coach Dash</h1>
        <p className="mt-1 text-sm text-[#9ca3af] dark:text-slate-400">
          SweatStats · Groq (streaming)
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col rounded-[25px] bg-gradient-to-br from-marine to-chat-end p-4 shadow-lg md:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]"
            aria-hidden
          />
          <span className="text-sm font-semibold text-white/90">Online</span>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-black/15 p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-pink text-white"
                  : "mr-auto bg-white/15 text-white"
              }`}
            >
              {m.content}
              {m.role === "assistant" &&
                pending &&
                i === messages.length - 1 &&
                m.content === "" && (
                  <span className="inline-block h-4 w-px animate-pulse bg-white/50" />
                )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {err && (
          <p className="mt-2 text-sm text-amber-200" role="alert">
            {err}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
            placeholder="Ask: how do I build base mileage safely?"
            className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45"
            disabled={pending}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => void send()}
            className="shrink-0 rounded-xl bg-pink px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
