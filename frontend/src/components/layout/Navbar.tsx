import "../../pages/auth/styles/navbar.css";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../api/authApi";


interface NavbarProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({ open, setOpen }: NavbarProps) => {

    const navigate = useNavigate();

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

                <h2>RetailPulse Analytics</h2>

            </div>

            <div className="nav-center">

                <input
                    type="text"
                    placeholder="Search..."
                />

            </div>

            <div className="nav-right">

                <NotificationsIcon className="nav-icon" />

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