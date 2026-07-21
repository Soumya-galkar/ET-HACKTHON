import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";

export default function DocumentViewer() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("text");
    const [q, setQ] = useState("");

    useEffect(() => { api.get(`/documents/${id}`).then((r) => setData(r.data)); }, [id]);

    const filteredText = useMemo(() => {
        if (!data) return "";
        if (!q) return data.text;
        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`, "gi");
        return data.text.replace(re, "<<HIT>>$1<</HIT>>");
    }, [data, q]);

    if (!data) return <div className="p-10 mono text-muted-foreground">Loading document…</div>;

    return (
        <div className="p-8" data-testid="doc-viewer">
            <Link to="/documents" className="mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mb-4" data-testid="back-docs">
                <ArrowLeft size={12} weight="bold" /> back to documents
            </Link>
            <div className="flex items-baseline justify-between mb-6">
                <div>
                    <div className="overline">Document</div>
                    <h1 className="font-heading text-3xl font-black tracking-tight">{data.document.filename}</h1>
                    <div className="mono text-xs text-muted-foreground mt-1">
                        {data.document.file_type.toUpperCase()} · {data.document.chunk_count} chunks · {data.document.entity_count} entities · {(data.document.size / 1024).toFixed(1)} KB
                    </div>
                </div>
            </div>

            <div className="flex gap-1 border-b border-border mb-4">
                {["text", "chunks", "entities", "related", "metadata"].map((t) => (
                    <button
                        key={t} onClick={() => setTab(t)} data-testid={`tab-${t}`}
                        className={`px-4 py-2 mono text-xs uppercase tracking-widest ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >{t}</button>
                ))}
            </div>

            {tab === "text" && (
                <div>
                    <div className="flex items-center gap-2 border border-border rounded-sm px-3 py-2 mb-4 bg-card max-w-lg">
                        <MagnifyingGlass size={16} className="text-muted-foreground" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inside document…"
                            className="bg-transparent outline-none w-full mono text-sm" data-testid="doc-search" />
                    </div>
                    <div className="panel p-6 mono text-sm whitespace-pre-wrap leading-relaxed max-h-[65vh] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: filteredText.replace(/<<HIT>>/g, '<mark style="background:#00E5FF;color:#000;padding:0 2px">').replace(/<<\/HIT>>/g, "</mark>") }}
                    />
                </div>
            )}

            {tab === "chunks" && (
                <div className="space-y-3">
                    {data.chunks.map((c) => (
                        <div key={c.id} className="panel p-4" data-testid={`chunk-${c.index}`}>
                            <div className="overline mb-2">Chunk #{c.index}</div>
                            <div className="mono text-sm whitespace-pre-wrap">{c.text}</div>
                        </div>
                    ))}
                </div>
            )}

            {tab === "entities" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.entities.length === 0 && <div className="text-muted-foreground mono text-sm">No entities extracted.</div>}
                    {data.entities.map((e) => (
                        <div key={e.id} className="panel p-4 border-t-2" style={{ borderTopColor: typeColor(e.type) }} data-testid={`entity-${e.id}`}>
                            <div className="flex justify-between items-start">
                                <div className="font-semibold">{e.label}</div>
                                <span className="mono text-xs uppercase text-muted-foreground">{e.type}</span>
                            </div>
                            {e.description && <div className="mono text-xs text-muted-foreground mt-2">{e.description}</div>}
                        </div>
                    ))}
                </div>
            )}

            {tab === "related" && (
                <div className="space-y-2">
                    {data.related.length === 0 && <div className="text-muted-foreground mono text-sm">No related documents.</div>}
                    {data.related.map((r) => (
                        <Link to={`/documents/${r.id}`} key={r.id} className="panel p-4 flex items-center justify-between hover:border-primary block">
                            <div className="mono">{r.filename}</div>
                            <div className="mono text-xs text-muted-foreground">shared: {r.shared_entities.join(", ")}</div>
                        </Link>
                    ))}
                </div>
            )}

            {tab === "metadata" && (
                <div className="panel p-6">
                    <pre className="mono text-xs whitespace-pre-wrap">{JSON.stringify(data.document, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

function typeColor(t) {
    const m = {
        Equipment: "#00E5FF", WorkOrder: "#FFD600", Department: "#B388FF",
        Technician: "#40C4FF", MaintenanceTask: "#00E676", Inspection: "#69F0AE",
        Pressure: "#FF80AB", Temperature: "#FF5722", Alarm: "#FF5722",
        Risk: "#FFAB40", Failure: "#FF1744", Manual: "#94A3B8", OEM: "#94A3B8", Document: "#94A3B8",
    };
    return m[t] || "#00E5FF";
}
