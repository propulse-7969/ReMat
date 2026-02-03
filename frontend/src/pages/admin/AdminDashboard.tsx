import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import MapView from "../components/MapView";
import type { Bin } from "../../types";


const AdminDashboard = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [bins, setBins] = useState<Bin[]>([]);
  const [loadingBins, setLoadingBins] = useState(true);

  // Fetch bins
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/bins/")
      .then(res => res.json())
      .then(data => {

        setBins((data.bins as Bin[]) || []);
        setLoadingBins(false);
      })
      .catch(err => {
        console.error("Failed to fetch bins", err);
        setLoadingBins(false);
      });
  }, []);

  // Auth loading
  if (!profile) {
    return <div>Setting up your account…</div>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };


  const totalBins = bins.length;
  const activeBins = bins.filter(b => b.status === "active");
  const fullBins = bins.filter(b => (b.fill_level ?? 0) >= 90);

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Hello Admin 👋</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
        <div style={cardStyle}>
            <strong>Total Bins</strong>
            <div>{totalBins}</div>
        </div>
        <div style={cardStyle}>
            <strong>Active Bins</strong>
            <div>{activeBins.length}</div>
        </div>
        <div style={cardStyle}>
            <strong>Full Bins</strong>
            <div style={{ color: fullBins.length > 0 ? 'red' : 'inherit' }}>
                {fullBins.length}
            </div>
        </div>
      </div>

      {/* Quick Actions */}
      <button
        style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}
        onClick={() => navigate("/admin/bins/add")}
      >
        ➕ Add New Bin
      </button>

      <button style={{ marginTop: 20, padding: "10px 20px", cursor: "pointer" }}
        onClick={() => navigate("/admin/bins")}>
        View All Bins
      </button>

      {/* Map */}
      <h2 style={{ marginTop: 30 }}>Active Bins Map</h2>

      {loadingBins ? (
        <p>Loading bins on map…</p>
      ) : (
        <MapView bins={activeBins} onMarkerClick={(bin) => navigate(`/admin/bins/${bin.id}`)} />
      )}
    </div>
  );
};

const cardStyle = {
    border: "1px solid #ddd", 
    padding: "1rem", 
    borderRadius: "8px", 
    minWidth: "100px" 
};

export default AdminDashboard;