import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {

    const [open, setOpen] = useState(false);

    return (

        <div>

            <Navbar
                open={open}
                setOpen={setOpen}
            />

            <Sidebar
                open={open}
                setOpen={setOpen}
            />

            <main
                className={
                    open ? "main-content shift" : "main-content"
                }
            >
                <Outlet />
            </main>

        </div>

    );

};

export default DashboardLayout;