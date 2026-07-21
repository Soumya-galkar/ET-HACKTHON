import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
