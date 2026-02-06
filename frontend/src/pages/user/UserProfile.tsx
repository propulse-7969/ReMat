import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { deleteUser } from "firebase/auth";
import { auth } from "../../services/firebase";
import SpotlightCard from "../components/SpotlightCard";

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
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone and you will lose all your points and recycling history.")) return;
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
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
      logout();
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-lg font-medium">Loading your profile…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-white/60">Manage your account settings and view your stats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
              <div className="flex items-start gap-6 mb-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <span className="text-4xl font-bold text-white">
                      {profile.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
                  <p className="text-white/60 text-sm mb-4">{profile.email}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-green-300/70 uppercase tracking-wide font-medium mb-1">Points</p>
                      <p className="text-xl font-bold text-green-400">{profile.points ?? 0}</p>
                    </div>
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-yellow-300/70 uppercase tracking-wide font-medium mb-1">Rank</p>
                      <p className="text-xl font-bold text-yellow-400">
                        {loading ? "..." : rank ? `#${rank}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 mb-8"></div>

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-2">Full Name</p>
                    <p className="text-white font-medium">{profile.name}</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-2">Email Address</p>
                    <p className="text-white font-medium truncate">{profile.email}</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-2">Total Points</p>
                    <p className="text-white font-medium">{profile.points ?? 0} points</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-2">Leaderboard Position</p>
                    <p className="text-white font-medium">
                      {loading ? "Loading..." : rank ? `#${rank}` : "Not ranked yet"}
                    </p>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* Actions Card */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Account Actions</h3>
              
              <div className="space-y-4">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>

                {/* Delete Account Button */}
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="w-full px-6 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? "Deleting Account..." : "Delete Account"}
                </button>
              </div>

              {/* Warning Message */}
              <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm text-red-300 font-medium mb-1">Permanent Action</p>
                    <p className="text-xs text-red-200/70 leading-relaxed">
                      Deleting your account is irreversible. All your points, recycling history, and personal data will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column - Stats & Achievements */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Summary */}
            <SpotlightCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Your Impact</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Recycling Progress</span>
                    <span className="text-sm font-semibold text-green-400">Level 3</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-white/40 mt-1">350 more points to Level 4</p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Items Recycled</span>
                    <span className="text-lg font-bold text-white">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">This Week</span>
                    <span className="text-lg font-bold text-white">+45 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Total Earned</span>
                    <span className="text-lg font-bold text-green-400">{profile.points ?? 0} pts</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* Achievements */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Achievements</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">First Recycle</p>
                    <p className="text-xs text-white/50">Recycled your first item</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-2xl">⚡</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Quick Starter</p>
                    <p className="text-xs text-white/50">Recycled 10 items</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg opacity-50">
                  <div className="text-2xl">🌟</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Eco Warrior</p>
                    <p className="text-xs text-white/50">Recycle 50 items</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg opacity-50">
                  <div className="text-2xl">💎</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Legend</p>
                    <p className="text-xs text-white/50">Recycle 100 items</p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;