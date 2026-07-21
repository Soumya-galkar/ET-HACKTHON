import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const riskColors = { low: "#00E676", medium: "#FFD600", high: "#FF5722", critical: "#FF1744" };

function List({ title, items }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="panel p-4">
            <div className="overline mb-3">{title}</div>
            <ul className="mono text-sm space-y-2 list-disc list-inside">
                {items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
        </div>
    );
}

export default function Maintenance() {
    const [equipment, setEquipment] = useState("");
    const [context, setContext] = useState("");
    const [busy, setBusy] = useState(false);
    const [current, setCurrent] = useState(null);
    const [reports, setReports] = useState([]);

    const load = () => api.get("/maintenance/reports").then((r) => setReports(r.data));
    useEffect(() => { load(); }, []);

    const gen = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const { data } = await api.post("/maintenance/report", { equipment, context });
            setCurrent(data);
            toast.success("Report generated");
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to generate report");
        } finally { setBusy(false); }
    };

    return (
        <div className="p-8" data-testid="maintenance-page">
            <div className="mb-6">
                <div className="overline">Maintenance Intelligence</div>
                <h1 className="font-heading text-4xl font-black tracking-tight">AI Report Generator</h1>
            </div>

            <form onSubmit={gen} className="panel p-5 mb-6 grid gap-3 md:grid-cols-3">
                <input required value={equipment} onChange={(e) => setEquipment(e.target.value)}
                    placeholder="Equipment (e.g. Pump P-101)"
                    className="bg-background border border-border px-3 py-2.5 mono text-sm outline-none focus:border-primary rounded-sm"
                    data-testid="maint-equipment" />
                <input value={context} onChange={(e) => setContext(e.target.value)}
                    placeholder="Additional context (optional)"
                    className="bg-background border border-border px-3 py-2.5 mono text-sm outline-none focus:border-primary rounded-sm md:col-span-2"
                    data-testid="maint-context" />
                <button disabled={busy} className="bg-primary text-primary-foreground px-4 py-2.5 font-semibold text-sm disabled:opacity-50 md:col-span-3" data-testid="maint-generate">
                    {busy ? "Analyzing…" : "Generate Report"}
                </button>
            </form>

            {current && (
                <div className="space-y-4 mb-8" data-testid="maint-current-report">
                    <div className="panel p-6 border-l-4" style={{ borderLeftColor: riskColors[current.risk_level] || "#94A3B8" }}>
                        <div className="flex justify-between items-baseline">
                            <div>
                                <div className="overline">Failure Summary — {current.equipment}</div>
                                <div className="mono text-base mt-2 leading-relaxed">{current.failure_summary || "(no summary)"}</div>
                            </div>
                            <div className="text-right">
                                <div className="overline">Risk</div>
                                <div className="mono text-2xl font-bold uppercase" style={{ color: riskColors[current.risk_level] }}>{current.risk_level}</div>
                            </div>
                        </div>
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="overline mb-1">Root Cause</div>
                                <div className="mono text-sm">{current.root_cause || "-"}</div>
                            </div>
                            <div>
                                <div className="overline mb-1">Estimated Downtime</div>
                                <div className="mono text-sm">{current.estimated_downtime || "-"}</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <List title="Recommended Actions" items={current.recommended_actions} />
                        <List title="Preventive Maintenance" items={current.preventive_maintenance} />
                        <List title="Predictive Maintenance" items={current.predictive_maintenance} />
                        <List title="Required Parts" items={current.required_parts} />
                        <List title="Required Skills" items={current.required_skills} />
                    </div>
                </div>
            )}

            <div className="panel p-5">
                <div className="overline mb-4">Previous Reports</div>
                {reports.length === 0 ? <div className="mono text-sm text-muted-foreground">No reports yet.</div> : (
                    <ul className="divide-y divide-border">
                        {reports.map((r) => (
                            <li key={r.id} className="py-3 flex justify-between items-center cursor-pointer hover:bg-secondary/40 px-2" onClick={() => setCurrent(r)} data-testid={`report-${r.id}`}>
                                <div>
                                    <div className="mono">{r.equipment}</div>
                                    <div className="mono text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                                </div>
                                <span className="mono text-xs uppercase" style={{ color: riskColors[r.risk_level] }}>{r.risk_level}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
