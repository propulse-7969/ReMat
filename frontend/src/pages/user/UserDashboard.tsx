import { useAuth } from "../../auth/useAuth";

const Dashboard = () => {
  const { profile } = useAuth();
  console.log(profile)

  return (
    <div>
      <h1>Hello {profile?.name} 👋</h1>
      <p>Welcome to the Smart E-Waste System</p>
    </div>
  );
};

export default Dashboard;
