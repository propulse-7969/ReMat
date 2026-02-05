import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import MapView from "../components/MapView";
import { type Bin } from "../../types";

// interface Bin {
//   id: string;
//   name: string;
//   lat: number;
//   lng: number;
//   capacity: number;
//   fill_level: number;
//   status: string;
// }

const AdminDashboard = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [bins, setBins] = useState<Bin[]>([]);
  const [loadingBins, setLoadingBins] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    active: true,
    maintenance: true,
    full: true
  });

  /* -----------------------------
     Fetch bins
  ------------------------------ */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/bins")
      .then(res => res.json())
      .then(data => {
        setBins(data.bins || []);
        setLoadingBins(false);
      })
      .catch(err => {
        console.error("Failed to fetch bins", err);
        setLoadingBins(false);
      });
  }, []);


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
  const fullBins = bins.filter(b => b.status === "full" || (b.fill_level ?? 0) >= 90);


  const filteredBins = bins.filter(bin => {
    if (filters.full && (bin.status==="full" ||  (bin.fill_level ?? 0) >= 90)) return true;
    if (filters.active && bin.status === "active" && (bin.fill_level ?? 0) < 90)
      return true;
    if (filters.maintenance && bin.status === "maintenance")
      return true;
    return false;
  });

  return (
    <div style={{ padding: "1.5rem" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h1>Hello Admin 👋</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>


      <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
        <div>Total Bins: {totalBins}</div>
        <div>Active Bins: {activeBins.length}</div>
        <div>Full Bins: {fullBins.length}</div>
      </div>


      <button
        style={{ marginTop: 20 }}
        onClick={() => navigate("/admin/bins/add")}>
        ➕ Add New Bin
      </button>

      <button style={{ marginTop: 20 }} onClick={() => navigate("/admin/bins")}>
        View All Bins
      </button>

      <button style={{ marginTop: 20 }} onClick={() => navigate("/admin/route")}>
        Create Pickup Route
      </button>


      <div style={{ marginTop: 25 }}>
        <strong>Filter bins on map:</strong>

        <div style={{ marginTop: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={filters.active}
              onChange={() =>
                setFilters({ ...filters, active: !filters.active })
              }
            />{" "}
            Active
          </label>

          <label style={{ marginLeft: 12 }}>
            <input
              type="checkbox"
              checked={filters.maintenance}
              onChange={() =>
                setFilters({
                  ...filters,
                  maintenance: !filters.maintenance
                })
              }
            />{" "}
            Maintenance
          </label>

          <label style={{ marginLeft: 12 }}>
            <input
              type="checkbox"
              checked={filters.full}
              onChange={() =>
                setFilters({ ...filters, full: !filters.full })
              }
            />{" "}
            Full
          </label>
        </div>
      </div>


      <h2 style={{ marginTop: 30 }}>Bins Map</h2>

      {loadingBins ? (
        <p>Loading bins on map…</p>
      ) : (
        <MapView
          bins={filteredBins}
          onMarkerClick={(bin: Bin) =>
            navigate(`/admin/bins/${bin.id}`)
          }
        />
      )}
    </div>
  );
};

export default AdminDashboard;
