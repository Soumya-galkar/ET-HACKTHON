import { useAuth } from "@/context/AuthContext";

export default function Profile() {
    const { user } = useAuth();
    if (!user) return null;
    return (
        <div className="p-8" data-testid="profile-page">
            <div className="overline">Account</div>
            <h1 className="font-heading text-4xl font-black tracking-tight mb-8">Profile</h1>
            <div className="panel p-6 max-w-lg">
                <div className="grid gap-4">
                    <div>
                        <div className="overline mb-1">Name</div>
                        <div className="mono">{user.name}</div>
                    </div>
                    <div>
                        <div className="overline mb-1">Email</div>
                        <div className="mono">{user.email}</div>
                    </div>
                    <div>
                        <div className="overline mb-1">Role</div>
                        <div className="mono uppercase">{user.role}</div>
                    </div>
                    <div>
                        <div className="overline mb-1">Member Since</div>
                        <div className="mono">{new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
