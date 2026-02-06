import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import MapView from "../components/MapView";
import type { Bin } from "../../types";
import SpotlightCard from "../components/SpotlightCard";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";

const UserDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bins/`);
        if (res.ok) {
          const data = await res.json();
          const remoteBins: Bin[] = (data.bins ?? []).map((b: { id: string; name?: string; lat: number; lng: number; status?: string; fill_level?: number; capacity?: number }) => ({
            id: b.id,
            name: b.name,
            lat: Number(b.lat),
            lng: Number(b.lng),
            status: b.status,
            fill_level: b.fill_level,
            capacity: b.capacity,
          }));
          setBins(remoteBins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBins();
  }, []);

  const activeBins = bins.filter((b) => b.status === "active");
  const totalCapacity = bins.reduce((sum, b) => sum + (b.capacity || 0), 0);
  const totalFillLevel = bins.reduce((sum, b) => sum + (b.fill_level || 0), 0);
  const avgFillPercentage = totalCapacity > 0 ? Math.round((totalFillLevel / totalCapacity) * 100) : 0;
  
  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : bins.length > 0
      ? [bins[0].lat, bins[0].lng]
      : [25.26, 82.98];

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-8 py-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-white text-lg font-medium">Setting up your account…</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-0">
      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    Welcome back, {profile.name}! 👋
                  </h1>
                  <p className="text-base text-white/60">Track your impact and manage e-waste efficiently</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-6 py-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-green-300/80 uppercase tracking-wider font-semibold mb-1">Total Points</p>
                    <p className="text-3xl font-bold text-green-400">{profile.points ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Points Card */}
          <SpotlightCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/20 px-3 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Your Points</p>
            <p className="text-3xl font-bold text-white">{profile.points ?? 0}</p>
          </SpotlightCard>

          {/* Active Bins Card */}
          <SpotlightCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Active Bins</p>
            <p className="text-3xl font-bold text-white">{activeBins.length}</p>
          </SpotlightCard>

          {/* Total Bins Card */}
          <SpotlightCard className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Total Bins</p>
            <p className="text-3xl font-bold text-white">{bins.length}</p>
          </SpotlightCard>

          {/* Avg Fill Level Card */}
          <SpotlightCard className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Avg Fill Level</p>
            <p className="text-3xl font-bold text-white">{avgFillPercentage}%</p>
          </SpotlightCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Action Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recycle CTA */}
            <SpotlightCard className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">♻️</div>
                <h3 className="text-2xl font-bold text-white mb-3">Ready to Recycle?</h3>
                <p className="text-green-50/90 mb-6 text-sm leading-relaxed">
                  Scan your e-waste and earn points for every item you recycle
                </p>
                <button
                  onClick={() => navigate("/user/recycle")}
                  className="w-full py-4 px-6 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Start Recycling Now
                </button>
              </div>
            </SpotlightCard>

            {/* Quick Stats */}
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200">
                  <span className="text-white/60 text-sm font-medium">This Week</span>
                  <span className="text-white font-semibold text-lg">+45 pts</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200">
                  <span className="text-white/60 text-sm font-medium">Items Recycled</span>
                  <span className="text-white font-semibold text-lg">12</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200">
                  <span className="text-white/60 text-sm font-medium">Leaderboard Rank</span>
                  <span className="text-yellow-400 font-semibold text-lg">#247</span>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col h-full min-h-[600px]">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Nearby E-Waste Bins
                </h2>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm font-medium">{activeBins.length} Active</span>
                </div>
              </div>
              
              <div className="flex-1 min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center h-full bg-white/5 rounded-xl">
                    <div className="text-center">
                      <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                      <p className="text-white/60 font-medium">Loading bins…</p>
                    </div>
                  </div>
                ) : bins.length === 0 ? (
                  <div className="flex items-center justify-center h-full bg-white/5 rounded-xl">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-white/60 font-medium">No bins available yet</p>
                      <p className="text-white/40 text-sm mt-2">Check back later for updates</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl h-full w-full">
                    <MapView
                      bins={bins}
                      center={mapCenter}
                      zoom={13}
                      height="100%"
                      showPopup={true}
                      userLocation={userLocation ?? undefined}
                    />
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>

      </div>
  );
};

export default UserDashboard;