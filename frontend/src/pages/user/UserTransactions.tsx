import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";

interface Transaction {
  id: string;
  waste_type: string;
  bin_id: string;
  created_at: string;
  points_awarded: number;
}

const Transactions = () => {
  const {profile} = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);


  const userId = profile?.uid;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/user/transactions/${userId}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTransactions();
    }
  }, [userId]);


  if (loading) {
    return <div className="p-6">Loading your eco-hero history 🌱...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No recycles yet. Go save the planet already ♻️
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
            className="border rounded-lg p-4 shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                Waste Type: <span className="capitalize">{txn.waste_type}</span>
              </p>
              <p className="text-sm text-gray-500">
                Bin ID: {txn.bin_id}
              </p>
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
    </div>
  );
};

export default Transactions;
