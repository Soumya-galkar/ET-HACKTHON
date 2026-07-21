import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    Gauge, Files, MagnifyingGlass, ChatCircleText, GraphIcon,
    Wrench, UserCircle, SignOut,
} from "@phosphor-icons/react";

const NAV = [
    { to: "/dashboard", label: "Dashboard", icon: Gauge, testid: "nav-dashboard" },
    { to: "/documents", label: "Documents", icon: Files, testid: "nav-documents" },
    { to: "/search", label: "Semantic Search", icon: MagnifyingGlass, testid: "nav-search" },
    { to: "/assistant", label: "AI Assistant", icon: ChatCircleText, testid: "nav-assistant" },
    { to: "/graph", label: "Knowledge Graph", icon: GraphIcon, testid: "nav-graph" },
    { to: "/maintenance", label: "Maintenance", icon: Wrench, testid: "nav-maintenance" },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    return (
        <aside className="w-60 border-r border-border bg-card flex flex-col" data-testid="app-sidebar">
            <div className="px-5 py-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 status-dot live" />
                    <div className="font-heading font-black text-lg tracking-tight" data-testid="brand">IKIP</div>
                </div>
                <div className="overline mt-1">Industrial · Knowledge · Intel</div>
            </div>
            <nav className="flex-1 py-4">
                {NAV.map((n) => (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        data-testid={n.testid}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-5 py-2.5 text-sm border-l-2 transition-colors duration-150 ${
                                isActive
                                    ? "border-primary text-foreground bg-secondary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            }`
                        }
                    >
                        <n.icon size={18} weight="bold" />
                        <span>{n.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="border-t border-border p-4">
                <NavLink to="/profile" data-testid="nav-profile" className="flex items-center gap-2 text-sm text-foreground mb-3 hover:text-primary">
                    <UserCircle size={22} weight="bold" />
                    <div className="flex flex-col leading-tight">
                        <span className="font-semibold truncate max-w-[140px]">{user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</span>
                    </div>
                </NavLink>
                <button
                    onClick={() => { logout(); nav("/login"); }}
                    data-testid="logout-btn"
                    className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest px-3 py-2 border border-border hover:border-primary hover:text-primary transition-colors"
                >
                    <SignOut size={14} weight="bold" /> Logout
                </button>
            </div>
        </aside>
    );
}
