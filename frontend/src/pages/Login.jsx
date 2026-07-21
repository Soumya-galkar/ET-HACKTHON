import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await login(email, password);
            nav("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Login failed");
        } finally { setBusy(false); }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            <div
                className="hidden md:block relative border-r border-border"
                style={{
                    backgroundImage: "linear-gradient(hsl(var(--background)/0.55), hsl(var(--background)/0.85)), url('https://images.pexels.com/photos/15288012/pexels-photo-15288012.jpeg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 p-10 flex flex-col justify-between">
                    <div>
                        <div className="overline mb-2">IKIP · v1.0</div>
                        <h1 className="font-heading font-black text-5xl leading-none tracking-tight">
                            Industrial<br />Knowledge<br />
                            <span className="text-primary">Intelligence.</span>
                        </h1>
                    </div>
                    <div className="mono text-xs text-muted-foreground border-l-2 border-primary pl-3">
                        &gt; OEM manuals, work orders, inspections — indexed, searched, and reasoned over by AI.
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center p-8">
                <form onSubmit={submit} className="w-full max-w-md panel p-8" data-testid="login-form">
                    <div className="overline mb-2">Access</div>
                    <h2 className="font-heading text-3xl font-bold mb-6">Sign in</h2>
                    <label className="overline block mb-1">Email</label>
                    <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        data-testid="login-email"
                        className="w-full bg-background border border-border rounded-sm px-3 py-2.5 mb-4 focus:outline-none focus:border-primary mono text-sm"
                    />
                    <label className="overline block mb-1">Password</label>
                    <input
                        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        data-testid="login-password"
                        className="w-full bg-background border border-border rounded-sm px-3 py-2.5 mb-6 focus:outline-none focus:border-primary mono text-sm"
                    />
                    <button
                        type="submit" disabled={busy} data-testid="login-submit"
                        className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-semibold tracking-wide hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {busy ? "Authenticating…" : "Enter Console"}
                    </button>
                    <div className="mt-5 text-sm text-muted-foreground text-center">
                        No account?{" "}
                        <Link to="/signup" className="text-primary hover:underline" data-testid="link-signup">Create one</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
