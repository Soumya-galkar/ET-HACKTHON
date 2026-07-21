import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { UploadSimple, Trash, ArrowsClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";

const statusColor = { ready: "live", processing: "warn", failed: "crit" };

export default function Documents() {
    const [docs, setDocs] = useState([]);
    const [busy, setBusy] = useState(false);
    const fileRef = useRef(null);

    const load = () => api.get("/documents").then((r) => setDocs(r.data));

    useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, []);

    const upload = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setBusy(true);
        const form = new FormData();
        form.append("file", f);
        try {
            await api.post("/documents/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success(`Uploaded ${f.name} — processing…`);
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Upload failed");
        } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
    };

    const del = async (id) => {
        if (!confirm("Delete this document?")) return;
        await api.delete(`/documents/${id}`);
        toast.success("Deleted");
        load();
    };

    return (
        <div className="p-8" data-testid="documents-page">
            <div className="flex items-baseline justify-between mb-8">
                <div>
                    <div className="overline">Ingest</div>
                    <h1 className="font-heading text-4xl font-black tracking-tight">Documents</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-primary hover:text-primary" data-testid="refresh-docs">
                        <ArrowsClockwise size={14} weight="bold" className="inline mr-1" /> Refresh
                    </button>
                    <label className={`bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-primary/90 ${busy ? "opacity-50 pointer-events-none" : ""}`} data-testid="upload-btn">
                        <UploadSimple size={16} weight="bold" className="inline mr-2" />
                        {busy ? "Uploading…" : "Upload"}
                        <input ref={fileRef} type="file" className="hidden" onChange={upload}
                            accept=".pdf,.docx,.txt,.xlsx,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff" data-testid="upload-input" />
                    </label>
                </div>
            </div>

            <div className="panel overflow-hidden">
                <table className="w-full mono text-sm">
                    <thead className="bg-secondary">
                        <tr className="text-left overline">
                            <th className="px-4 py-3">File</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Chunks</th>
                            <th className="px-4 py-3">Entities</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {docs.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                No documents yet. Upload PDF, DOCX, XLSX, TXT or images to begin.
                            </td></tr>
                        )}
                        {docs.map((d) => (
                            <tr key={d.id} className="border-t border-border hover:bg-secondary/40" data-testid={`doc-row-${d.id}`}>
                                <td className="px-4 py-3">
                                    <Link to={`/documents/${d.id}`} className="hover:text-primary" data-testid={`doc-link-${d.id}`}>
                                        {d.filename}
                                    </Link>
                                    {d.error && <div className="text-xs text-warning mt-1">{d.error}</div>}
                                </td>
                                <td className="px-4 py-3 uppercase text-muted-foreground">{d.file_type}</td>
                                <td className="px-4 py-3">{d.chunk_count}</td>
                                <td className="px-4 py-3">{d.entity_count}</td>
                                <td className="px-4 py-3">
                                    <span className={`status-dot ${statusColor[d.status]} mr-2`} />
                                    <span className="uppercase text-xs">{d.status}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => del(d.id)} className="text-muted-foreground hover:text-warning" data-testid={`doc-delete-${d.id}`}>
                                        <Trash size={16} weight="bold" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
