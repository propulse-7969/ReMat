import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoutes";

import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import UserDashboard from "../pages/user/UserDashboard";
import UserProfile from "../pages/user/UserProfile";
import UserRecycle from "../pages/user/UserRecycle";
import UserRewards from "../pages/user/UserRewards";
import UserTransactions from "../pages/user/UserTransactions";
import UserLeaderboard from "../pages/user/UserLeaderboard";


import AdminDashboard from "../pages/admin/AdminDashboard";
import AddBin from "../pages/admin/bins/AddBin";
import ViewBins from "../pages/admin/bins/ViewBins";

import Unauthorized from "../pages/Unauthorized";
import RoleRedirect from "./RoleRedirect";
import BinDetails from "../pages/admin/bins/BinDetails";
import PickupRoute from "../pages/admin/bins/PickupRoute";
import BinScreen from "../pages/bin/BinScreen";



export const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/auth/login",
        element: <Login />
    },
    {
        path: "/auth/signup",
        element: <Signup />
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <RoleRedirect />
            </ProtectedRoute>
        )
    },
    {
        path: "/unauthorized",
        element: <Unauthorized />

    },
    {
        path: "/bin/:binId",
        element: <BinScreen />
    },
    {
        path: "/user",
        element: (
            <ProtectedRoute role="user">
                <UserLayout />
            </ProtectedRoute>
        ),
        children: [
            {path:"dashboard", element: <UserDashboard />},
            { index: true, element: <Navigate to="dashboard" replace /> },
            {path:"profile", element: <UserProfile />},
            {path:"recycle", element: <UserRecycle />},
            {path:"rewards",element: <UserRewards />},
            {path:"transactions", element: <UserTransactions />},
            {path:"leaderboard",element: <UserLeaderboard />},
        ]
    },
    {
        path: "/admin",
        element: (
            <ProtectedRoute role="admin">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {path: "dashboard", element: <AdminDashboard />},
            {path: "bins/add", element: <AddBin />},
            {path: "bins", element: <ViewBins />},
            {path: "bins/:binId", element: <BinDetails />},
            {path: "route", element: <PickupRoute />},
            { index: true, element: <Navigate to="dashboard" replace /> },
        ]
    }
])