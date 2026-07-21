import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { PaperPlaneTilt, Robot, User as UserIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export default function Assistant() {
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

    const send = async (e) => {
        e.preventDefault();
        if (!input.trim() || busy) return;
        const q = input.trim();
        setInput("");
        setMessages((m) => [...m, { role: "user", content: q }]);
        setBusy(true);
        try {
            const { data } = await api.post("/chat", { session_id: sessionId, message: q });
            setSessionId(data.session_id);
            setMessages((m) => [...m, { role: "assistant", content: data.answer, sources: data.sources }]);
        } catch (err) {
            setMessages((m) => [...m, { role: "assistant", content: "Error: " + (err.response?.data?.detail || err.message) }]);
        } finally { setBusy(false); }
    };

    return (
        <div className="flex flex-col h-screen" data-testid="assistant-page">
            <div className="p-8 pb-4 border-b border-border">
                <div className="overline">Grounded RAG</div>
                <h1 className="font-heading text-4xl font-black tracking-tight">AI Assistant</h1>
                <div className="mono text-xs text-muted-foreground mt-2">Gemini 3 Flash · answers grounded in your indexed documents</div>
            </div>

            <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
                {messages.length === 0 && (
                    <div className="panel p-6 border-l-2 border-primary max-w-3xl">
                        <div className="overline mb-2">Try asking</div>
                        <ul className="mono text-sm space-y-1 text-muted-foreground">
                            <li>&gt; What is the maintenance schedule for pump P-101?</li>
                            <li>&gt; List recent failure modes in the compressor units.</li>
                            <li>&gt; What safety procedures apply to vessel inspection?</li>
                        </ul>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className="max-w-3xl" data-testid={`msg-${i}`}>
                        <div className="flex items-center gap-2 mb-2 overline">
                            {m.role === "user" ? <UserIcon size={14} weight="bold" /> : <Robot size={14} weight="bold" />}
                            {m.role === "user" ? "You" : "Assistant"}
                        </div>
                        <div className={`panel p-4 ${m.role === "assistant" ? "border-l-2 border-primary" : ""}`}>
                            <div className="mono text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                        </div>
                        {m.sources && m.sources.length > 0 && (
                            <div className="mt-2 space-y-1">
                                <div className="overline">Sources</div>
                                {m.sources.map((s, j) => (
                                    <Link key={j} to={`/documents/${s.document_id}`} className="block panel p-2 mono text-xs text-muted-foreground hover:text-primary hover:border-primary">
                                        [{j + 1}] score {s.score} · {s.snippet}…
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {busy && <div className="mono text-xs text-primary flex items-center gap-2"><span className="status-dot live" /> generating…</div>}
                <div ref={endRef} />
            </div>

            <form onSubmit={send} className="border-t border-border p-4 flex gap-3 items-center bg-card">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the assistant…" className="flex-1 bg-background border border-border px-4 py-3 mono text-sm outline-none focus:border-primary rounded-sm"
                    data-testid="chat-input" />
                <button disabled={busy || !input.trim()} className="bg-primary text-primary-foreground px-4 py-3 disabled:opacity-40" data-testid="chat-send">
                    <PaperPlaneTilt size={18} weight="bold" />
                </button>
            </form>
        </div>
    );
}
