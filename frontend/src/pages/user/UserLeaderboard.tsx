import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";

const PAGE_SIZE = 10;

type User = {
  id: string;
  name: string;
  points: number;
}

const UserLeaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const { profile } = useAuth();

  const currentUserId = profile?.uid;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/user/leaderboard?page=${page}&limit=${PAGE_SIZE}`
        );

        if (!res.ok) throw new Error("Failed to fetch leaderboard");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screenflex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-white">Loading leaderboard...</p>
          <p className="text-white/50 text-sm mt-2">Fetching top performers 🏆</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-white/60 text-lg">Top recyclers making a difference</p>
        </div>

        {/* Podium - Top 3 */}
        {page === 1 && users.length >= 3 && (
          <div className="mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Top Performers
              </h2>
              
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {/* 2nd Place */}
                <div className="order-1 md:order-1">
                  <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-300/30">
                    <div className="text-5xl mb-3">🥈</div>
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1 truncate">{users[1].name}</h3>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-base font-bold text-white">{users[1].points}</span>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="order-2 md:order-2 col-span-3 md:col-span-1">
                  <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-xl p-8 text-center shadow-2xl transform md:-translate-y-4 hover:scale-105 transition-all duration-300 border-2 border-yellow-300/50">
                    <div className="text-6xl mb-3 animate-bounce">🥇</div>
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/60 shadow-lg">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                    <h3 className="font-bold text-white text-xl mb-2 truncate">{users[0].name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xl font-bold text-white">{users[0].points}</span>
                    </div>
                    <div className="mt-4 inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <span className="text-xs font-semibold text-white uppercase tracking-wide">Champion</span>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:order-3">
                  <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 text-center shadow-xl transform hover:scale-105 transition-all duration-300 border border-amber-500/30">
                    <div className="text-5xl mb-3">🥉</div>
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1 truncate">{users[2].name}</h3>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-base font-bold text-white">{users[2].points}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              All Rankings
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">Rank</th>
                  <th className="p-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">User</th>
                  <th className="p-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">Points</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {users.map((user, idx) => {
                  const rank = (page - 1) * PAGE_SIZE + idx + 1;
                  const isCurrentUser = user.id === currentUserId;
                  const isTopThree = page === 1 && rank <= 3;

                  return (
                    <tr
                      key={user.id}
                      className={`transition-all duration-200 ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-l-4 border-green-500"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isTopThree ? (
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">{rank}</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                              <span className="text-white/80 font-semibold text-sm">{rank}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            isCurrentUser
                              ? "bg-gradient-to-br from-green-400 to-emerald-500"
                              : "bg-gradient-to-br from-blue-500 to-purple-600"
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isCurrentUser ? "text-green-400" : "text-white"}`}>
                                {user.name}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-semibold text-green-400">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          <span className="text-lg font-bold text-white">{user.points}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/0">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-white">Page {page}</span>
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < PAGE_SIZE}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 group"
              >
                Next
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-white/60 text-lg">No rankings available yet</p>
            <p className="text-white/40 text-sm mt-2">Be the first to recycle and earn points!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLeaderboard;