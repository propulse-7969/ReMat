import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";

const PAGE_SIZE = 10;

const podiumColors = [
  "bg-yellow-300", 
  "bg-gray-300",   
  "bg-amber-600"   
];

type User = {
  id: string;
  name: string;
  points: number;

}

const UserLeaderboard = () => {
  const [users, setUsers] = useState<User[]>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const {profile} = useAuth()

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
    return <div className="p-6">Loading leaderboard… 🏆</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Leaderboard</h2>


      {page === 1 && (users?.length ?? 0) >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {users?.slice(0, 3).map((user, idx) => (
            <div
              key={user.id}
              className={`rounded-lg p-4 text-center font-semibold ${podiumColors[idx]}`}
            >
              <div className="text-xl">
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
              </div>
              <div className="mt-2">{user.name}</div>
              <div className="text-sm">{user.points} pts</div>
            </div>
          ))}
        </div>
      )}

  
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-right">Points</th>
            </tr>
          </thead>

          <tbody>
            {users?.map((user, idx) => {
              const rank = (page - 1) * PAGE_SIZE + idx + 1;
              const isCurrentUser = user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  className={`border-b ${
                    isCurrentUser ? "bg-green-100 font-semibold" : ""
                  }`}
                >
                  <td className="p-3">{rank}</td>

                  <td className="p-3">
                    {user.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-green-700">(You)</span>
                    )}
                  </td>

                  <td className="p-3 text-right">{user.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          ← Prev
        </button>

        <span className="text-sm text-gray-600">Page {page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={(users?.length ?? 0) < PAGE_SIZE}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default UserLeaderboard;
