import "../../pages/auth/styles/navbar.css";

import MenuIcon from "@mui/icons-material/Menu";

import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useLocation, useNavigate } from "react-router-dom";

import { logoutUser } from "../../api/authApi";

import NotificationBell from "./NotificationBell";


interface NavbarProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({ open, setOpen }: NavbarProps) => {

    const navigate = useNavigate();

    const location = useLocation();

    const pageTitles: Record<string, string> = {
        "/dashboard": "Dashboard",
        "/users/add": "Add User",
        "/customers": "Customers",
        "/orders": "Orders",
        "/products": "Products",
        "/categories": "Categories",
        "/inventory": "Inventory",
        "/analytics": "Analytics",
        "/forecast": "Demand Forecast",
        "/audit-logs": "Audit Logs",
        "/notifications": "Notifications",
        "/settings": "Settings",
    };

    const currentPage =
        pageTitles[location.pathname] || "Dashboard";



    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const logout = async () => {

        console.log("Logout button clicked");

        try {

            console.log("Calling logout API...");

            const res = await logoutUser();

            console.log("Logout Response:", res.data);

        } catch (err) {

            console.error("Logout Error:", err);

        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (

        <header className="navbar">

            <div className="nav-left">

                <button
                    className="menu-btn"
                    onClick={() => setOpen(!open)}
                >
                    <MenuIcon />
                </button>

                <div className="nav-title">
                    <h2>RetailPulse Analytics</h2>
                    <span>{currentPage}</span>
                </div>

            </div>

            {/* <div className="nav-center">

                <input
                    type="text"
                    placeholder="Search..."
                />

            </div> */}


            <div className="nav-right">


                <NotificationBell />
                <div className="user-info">

                    <AccountCircleIcon />

                    <div>

                        <h4>{user.name}</h4>

                        <small>{user.role}</small>

                    </div>

                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >

                    <LogoutIcon />

                    Logout

                </button>

            </div>



        </header>

    );

};

export default Navbar;