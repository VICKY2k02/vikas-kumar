import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({
    children,
    allowedRoles
}: any) => {

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    if (
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
};

export default RoleProtectedRoute;