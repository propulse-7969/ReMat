import { useAuth } from "../../auth/useAuth";

const AdminDashboard = () => {
  const { profile } = useAuth();

  return (
    <div>
      <h1>Hello Admin {profile?.name} 👋</h1>
    </div>
  );
};

export default AdminDashboard;
