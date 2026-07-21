import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Files, Wrench, Cpu, GraphIcon } from "@phosphor-icons/react";

const COLORS = ["#00E5FF", "#00E676", "#FFD600", "#FF5722", "#B388FF", "#40C4FF", "#FF80AB"];

function Kpi({ label, value, icon: Icon, testid }) {
    return (
        <div className="panel p-5 h-full" data-testid={testid}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="overline">{label}</div>
                    <div className="mono text-4xl font-semibold mt-2 tracking-tight text-foreground">{value}</div>
                </div>
                <Icon size={20} weight="bold" className="text-primary" />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/dashboard").then((r) => setData(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return <div className="p-10 mono text-muted-foreground">Loading dashboard…</div>;
    }

    const proc = data.processing_status;
    const procData = [
        { name: "Ready", value: proc.ready },
        { name: "Processing", value: proc.processing },
        { name: "Failed", value: proc.failed },
    ];
    const typeData = Object.entries(data.graph_stats.by_type).map(([name, value]) => ({ name, value }));

    return (
        <div className="p-8" data-testid="dashboard-page">
            <div className="flex items-baseline justify-between mb-8">
                <div>
                    <div className="overline">Command Console</div>
                    <h1 className="font-heading text-4xl font-black tracking-tight">Dashboard</h1>
                </div>
                <div className="mono text-xs text-muted-foreground flex items-center gap-2">
                    <span className="status-dot live" /> live
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Kpi label="Documents" value={data.totals.documents} icon={Files} testid="kpi-documents" />
                <Kpi label="Equipment" value={data.totals.equipment} icon={Cpu} testid="kpi-equipment" />
                <Kpi label="Open Work Orders" value={data.totals.open_work_orders} icon={Wrench} testid="kpi-work-orders" />
                <Kpi label="Graph Nodes" value={data.graph_stats.total_nodes} icon={GraphIcon} testid="kpi-graph-nodes" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="panel p-5">
                    <div className="overline mb-4">Processing Status</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={procData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                                {procData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#141824", border: "1px solid #232B3B", borderRadius: 2 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-2 mono text-xs mt-2">
                        <div><span className="status-dot live mr-1.5" /> Ready {proc.ready}</div>
                        <div><span className="status-dot warn mr-1.5" /> Proc {proc.processing}</div>
                        <div><span className="status-dot crit mr-1.5" /> Fail {proc.failed}</div>
                    </div>
                </div>
                <div className="panel p-5 lg:col-span-2">
                    <div className="overline mb-4">Knowledge Graph — Nodes by Type</div>
                    {typeData.length === 0 ? (
                        <div className="mono text-sm text-muted-foreground py-16 text-center">No entities extracted yet. Upload a document to begin.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={typeData}>
                                <XAxis dataKey="name" tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "#94A3B8" }} />
                                <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "#94A3B8" }} />
                                <Tooltip contentStyle={{ background: "#141824", border: "1px solid #232B3B", borderRadius: 2 }} />
                                <Bar dataKey="value" fill="#00E5FF" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="panel p-5" data-testid="recent-documents">
                    <div className="overline mb-4">Recent Uploads</div>
                    {data.recent_documents.length === 0 ? (
                        <div className="mono text-sm text-muted-foreground">No documents yet.</div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {data.recent_documents.map((d) => (
                                <li key={d.id} className="py-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`status-dot ${d.status === "ready" ? "live" : d.status === "failed" ? "crit" : "warn"}`} />
                                        <div className="mono text-sm truncate">{d.filename}</div>
                                    </div>
                                    <div className="mono text-xs uppercase text-muted-foreground">{d.file_type}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="panel p-5" data-testid="recent-work-orders">
                    <div className="overline mb-4">Recent Work Orders</div>
                    {data.recent_work_orders.length === 0 ? (
                        <div className="mono text-sm text-muted-foreground">No work orders yet.</div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {data.recent_work_orders.map((w) => (
                                <li key={w.id} className="py-2 flex items-center justify-between">
                                    <div className="mono text-sm">{w.title}</div>
                                    <div className="mono text-xs uppercase text-muted-foreground">{w.status}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
