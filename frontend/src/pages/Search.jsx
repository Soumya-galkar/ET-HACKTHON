import { useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function Search() {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [busy, setBusy] = useState(false);
    const [ran, setRan] = useState(false);

    const run = async (e) => {
        e.preventDefault();
        if (!q.trim()) return;
        setBusy(true);
        try {
            const { data } = await api.post("/search", { query: q, top_k: 10 });
            setResults(data.results);
            setRan(true);
        } finally { setBusy(false); }
    };

    return (
        <div className="p-8" data-testid="search-page">
            <div className="mb-6">
                <div className="overline">Retrieval</div>
                <h1 className="font-heading text-4xl font-black tracking-tight">Semantic Search</h1>
            </div>
            <form onSubmit={run} className="panel p-4 flex items-center gap-3 mb-6">
                <MagnifyingGlass size={20} className="text-primary" />
                <input value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder='Ask anything — e.g. "pump P-101 vibration alarm history"'
                    className="flex-1 bg-transparent outline-none mono text-sm"
                    data-testid="search-input" />
                <button disabled={busy} className="bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold disabled:opacity-50" data-testid="search-run">
                    {busy ? "Searching…" : "Search"}
                </button>
            </form>

            {ran && results.length === 0 && (
                <div className="panel p-10 text-center text-muted-foreground mono text-sm">No results. Try uploading documents first.</div>
            )}

            <div className="space-y-3">
                {results.map((r, i) => (
                    <div key={r.chunk_id} className="panel p-5 border-l-2 border-primary" data-testid={`result-${i}`}>
                        <div className="flex justify-between items-center mb-2">
                            <Link to={`/documents/${r.document_id}`} className="mono text-sm hover:text-primary">
                                {r.document_filename}
                            </Link>
                            <div className="mono text-xs text-muted-foreground">score {r.score.toFixed(3)} · chunk #{r.index}</div>
                        </div>
                        <div className="mono text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{r.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
