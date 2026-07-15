import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/dashboard/Dashboard";

import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import DashboardLayout from "../components/layout/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";

import AddUser from "../components/layout/AddUser";

import AuditLogs from "../pages/AuditLogs";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Profile from "../pages/Profile";


const AppRoutes = () => {

    return (

        <Routes>

            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />

            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >


                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route

                    path="/audit-logs"

                    element={

                        <ProtectedRoute>

                            <RoleProtectedRoute

                                allowedRoles={[

                                    "Company Admin",

                                    "Super Admin"

                                ]}

                            >

                                <AuditLogs />

                            </RoleProtectedRoute>

                        </ProtectedRoute>

                    }

                />

                <Route
                    path="/users/add"
                    element={<AddUser />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

            </Route>


        </Routes>



    );

};

export default AppRoutes;