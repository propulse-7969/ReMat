import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { deleteUser } from "firebase/auth";
import { auth } from "../../services/firebase";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";

const UserProfile = () => {
  const { profile, token, logout } = useAuth();
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRank = async () => {
      if (!profile?.uid) return;
      try {
        const res = await fetch(
          `${API_BASE}/user/leaderboard?page=1&limit=1000`
        );
        if (!res.ok) return;
        const users: { id: string }[] = await res.json();
        const idx = users.findIndex((u) => u.id === profile.uid);
        setRank(idx >= 0 ? idx + 1 : null);
      } catch {
        setRank(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRank();
  }, [profile?.uid]);

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete account");
      const currentUser = auth.currentUser;
      if (currentUser) await deleteUser(currentUser);
    } catch (err) {
      console.error(err);
      alert("Failed to delete account. Try again.");
    } finally {
      setDeleting(false);
      logout();
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!profile) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Profile</h2>

      <div className="space-y-3 mb-8">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Points:</strong> {profile.points ?? 0} pts</p>
        <p>
          <strong>Leaderboard Rank:</strong>{" "}
          {loading ? "…" : rank ? `#${rank}` : "—"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Logout
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete Account"}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
