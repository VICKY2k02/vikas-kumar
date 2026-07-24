import {
    Dashboard,
    Settings,
    Logout,
    History,
    Person,
    Analytics,
    PersonAdd
} from "@mui/icons-material";


import { NavLink, useNavigate } from "react-router-dom";
import "../../pages/auth/styles/sidebar.css";
import { logoutUser } from "../../api/authApi";

import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";


interface SidebarProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const logout = async () => {

        try {

            await logoutUser();

        } catch (err) {

            console.log(err);

        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const closeSidebar = () => {

        setOpen(false);

    };

    return (

        <div className={open ? "sidebar open" : "sidebar"}>

            <h2 className="logo">
                RetailPulse
            </h2>

            {/* Dashboard */}

            <NavLink
                to="/dashboard"
                onClick={closeSidebar}
            >
                <Dashboard />
                <span>Dashboard</span>
            </NavLink>


            {/* Profile */}

            <NavLink
                to="/profile"
                onClick={closeSidebar}
            >
                <Person />
                <span>Profile</span>
            </NavLink>

            {/* Add User */}

            {(user.role === "Company Admin" ||
                user.role === "Super Admin") && (

                    <NavLink
                        to="/users/add"
                        onClick={closeSidebar}
                    >
                        <PersonAdd />
                        <span>Add User</span>
                    </NavLink>

                )}

            {/* Analytics */}

            {(user.role === "Company Admin" ||
                user.role === "Super Admin" ||
                user.role === "Analyst") && (

                    <>
                        <NavLink
                            to="/analytics"
                            onClick={closeSidebar}
                        >
                            <Analytics />
                            <span>Analytics</span>
                        </NavLink>

                        <NavLink
                            to="/categories"
                            onClick={closeSidebar}
                        >
                            <CategoryIcon />
                            <span>Categories</span>
                        </NavLink>

                        <NavLink
                            to="/products"
                            onClick={closeSidebar}
                        >
                            <Inventory2Icon />
                            <span>Products</span>
                        </NavLink>


                        <NavLink
                            to="/sales"
                            onClick={closeSidebar}
                        >
                            <PointOfSaleIcon />
                            <span>Sales</span>
                        </NavLink>

                        <NavLink
                            to="/inventory"
                            onClick={closeSidebar}
                        >
                            <Inventory2Icon />
                            <span>Inventory</span>
                        </NavLink>


 

                    </>

                )}

            {/* Audit Logs */}

            {(user.role === "Company Admin" ||
                user.role === "Super Admin") && (

                    <NavLink
                        to="/audit-logs"
                        onClick={closeSidebar}
                    >
                        <History />
                        <span>Audit Logs</span>
                    </NavLink>

                )}


            {/* Settings */}

            <NavLink
                to="/settings"
                onClick={closeSidebar}
            >
                <Settings />
                <span>Settings</span>
            </NavLink>

            {/* Logout */}

            <button
                type="button"
                className="logout-btn"
                onClick={logout}
            >
                <Logout />
                <span>Logout</span>
            </button>

        </div>

    );

};

export default Sidebar;