import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoutes";

import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import UserDashboard from "../pages/user/UserDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AddBin from "../pages/admin/bins/AddBin";
import ViewBins from "../pages/admin/bins/ViewBins";

import Unauthorized from "../pages/Unauthorized";
import RoleRedirect from "./RoleRedirect";
import BinDetails from "../pages/admin/bins/BinDetails";


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
        path: "/user/dashboard",
        element: (
            <ProtectedRoute role="user">
                <UserDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: "/admin/dashboard",
        element: (
            <ProtectedRoute role="admin">
                <AdminDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: "/unauthorized",
        element: <Unauthorized />

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
            { index: true, element: <Navigate to="dashboard" replace /> },
        ]
    }
])