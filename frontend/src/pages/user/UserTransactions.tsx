import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";

const PAGE_SIZE = 10;

type Transaction = {
  id: string;
  waste_type: string;
  bin_id: string;
  created_at: string;
  points_awarded: number;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const {profile} = useAuth()

  const userId = profile?.uid;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";
        const res = await fetch(
          `${API_BASE}/user/transactions/${userId}?page=${page}&limit=${PAGE_SIZE}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchTransactions();
  }, [userId, page]);

  if (loading) {
    return <div className="p-6">Loading transactions… ♻️</div>;
  }

  if (transactions.length === 0 && page === 1) {
    return (
      <div className="p-6 text-gray-500">
        No recycles yet. Planet still waiting 🌍
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Transactions</h2>

      <div className="space-y-4">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium capitalize">
                Waste Type: {txn.waste_type}
              </p>
              <p className="text-sm text-gray-500">Bin ID: {txn.bin_id}</p>
              <p className="text-sm text-gray-500">
                {new Date(txn.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-green-600 font-semibold text-lg">
              +{txn.points_awarded} pts
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          ← Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {page}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={transactions.length < PAGE_SIZE}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Transactions;
