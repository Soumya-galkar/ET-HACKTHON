import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { api } from "@/lib/api";

const TYPE_COLORS = {
    Equipment: "#00E5FF", WorkOrder: "#FFD600", Department: "#B388FF",
    Technician: "#40C4FF", MaintenanceTask: "#00E676", Inspection: "#69F0AE",
    Pressure: "#FF80AB", Temperature: "#FF5722", Alarm: "#FF5722",
    Risk: "#FFAB40", Failure: "#FF1744", Manual: "#94A3B8", OEM: "#94A3B8", Document: "#94A3B8",
};

function layoutGraph(nodes, edges) {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 80 });
    nodes.forEach((n) => g.setNode(n.id, { width: 180, height: 60 }));
    edges.forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);
    return nodes.map((n) => {
        const p = g.node(n.id);
        return { ...n, position: { x: p.x - 90, y: p.y - 30 } };
    });
}

export default function KnowledgeGraph() {
    const [raw, setRaw] = useState({ nodes: [], edges: [], stats: {} });
    const [filter, setFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => { api.get("/graph").then((r) => setRaw(r.data)); }, []);

    const { nodes, edges } = useMemo(() => {
        const filteredNodes = raw.nodes.filter((n) => {
            if (typeFilter !== "all" && n.type !== typeFilter) return false;
            if (filter && !n.label.toLowerCase().includes(filter.toLowerCase())) return false;
            return true;
        });
        const nodeIds = new Set(filteredNodes.map((n) => n.id));
        const filteredEdges = raw.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

        const rfNodes = filteredNodes.map((n) => ({
            id: n.id,
            type: "industrial",
            data: { label: n.label, type: n.type },
            position: { x: 0, y: 0 },
        }));
        const rfEdges = filteredEdges.map((e) => ({
            id: e.id, source: e.source, target: e.target, label: e.label,
            style: { stroke: "#232B3B" }, labelStyle: { fontFamily: "IBM Plex Mono", fontSize: 10, fill: "#94A3B8" },
        }));
        return { nodes: layoutGraph(rfNodes, rfEdges), edges: rfEdges };
    }, [raw, filter, typeFilter]);

    const nodeTypes = useMemo(() => ({
        industrial: ({ data }) => (
            <div className="react-flow__node-industrial" style={{ borderTopColor: TYPE_COLORS[data.type] || "#00E5FF" }} data-testid={`node-${data.label}`}>
                <div className="text-[10px] uppercase text-muted-foreground tracking-widest">{data.type}</div>
                <div className="text-sm font-semibold truncate">{data.label}</div>
            </div>
        ),
    }), []);

    return (
        <div className="flex flex-col h-screen" data-testid="graph-page">
            <div className="p-8 pb-4 border-b border-border flex items-baseline justify-between">
                <div>
                    <div className="overline">Knowledge Fabric</div>
                    <h1 className="font-heading text-4xl font-black tracking-tight">Knowledge Graph</h1>
                    <div className="mono text-xs text-muted-foreground mt-1">
                        {raw.stats.total_nodes || 0} nodes · {raw.stats.total_edges || 0} edges
                    </div>
                </div>
                <div className="flex gap-2">
                    <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter nodes…"
                        className="bg-background border border-border px-3 py-2 mono text-sm outline-none focus:border-primary rounded-sm"
                        data-testid="graph-filter" />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-background border border-border px-3 py-2 mono text-sm outline-none focus:border-primary rounded-sm"
                        data-testid="graph-type-filter">
                        <option value="all">All types</option>
                        {Object.keys(raw.stats.by_type || {}).map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex-1">
                {nodes.length === 0 ? (
                    <div className="p-16 mono text-sm text-muted-foreground text-center">
                        No entities in graph yet. Upload documents so the AI can extract equipment, work orders and relationships.
                    </div>
                ) : (
                    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.1}>
                        <Background gap={24} size={1} color="#232B3B" />
                        <Controls />
                        <MiniMap nodeColor={(n) => TYPE_COLORS[n.data?.type] || "#00E5FF"} maskColor="rgba(10,13,20,0.7)" />
                    </ReactFlow>
                )}
            </div>
        </div>
    );
}
