import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Signup() {
    const { signup } = useAuth();
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await signup(name, email, password);
            nav("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Signup failed");
        } finally { setBusy(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <form onSubmit={submit} className="w-full max-w-md panel p-8" data-testid="signup-form">
                <div className="overline mb-2">Onboarding</div>
                <h2 className="font-heading text-3xl font-bold mb-6">Create account</h2>
                <label className="overline block mb-1">Name</label>
                <input
                    required value={name} onChange={(e) => setName(e.target.value)}
                    data-testid="signup-name"
                    className="w-full bg-background border border-border rounded-sm px-3 py-2.5 mb-4 focus:outline-none focus:border-primary mono text-sm"
                />
                <label className="overline block mb-1">Email</label>
                <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    data-testid="signup-email"
                    className="w-full bg-background border border-border rounded-sm px-3 py-2.5 mb-4 focus:outline-none focus:border-primary mono text-sm"
                />
                <label className="overline block mb-1">Password (min 6)</label>
                <input
                    type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    data-testid="signup-password"
                    className="w-full bg-background border border-border rounded-sm px-3 py-2.5 mb-6 focus:outline-none focus:border-primary mono text-sm"
                />
                <button
                    type="submit" disabled={busy} data-testid="signup-submit"
                    className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-semibold tracking-wide hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    {busy ? "Creating…" : "Create Account"}
                </button>
                <div className="mt-5 text-sm text-muted-foreground text-center">
                    Have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline" data-testid="link-login">Sign in</Link>
                </div>
            </form>
        </div>
    );
}
