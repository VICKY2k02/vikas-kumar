// import {
//     Box,
//     Typography,
//     Paper,
//     Grid
// } from "@mui/material";

// import "../../pages/auth/styles/dashboard.css";


// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";

// import { useEffect, useState } from "react";
// import { getDashboardSummary } from "../../api/dashboardApi";

// const Dashboard = () => {

//     const { user } = useContext(AuthContext);

//     const [summary, setSummary] = useState<any>({});

//     const loadSummary = async () => {
//         const res = await getDashboardSummary();
//         setSummary(res.data);
//     };

//     useEffect(() => {
//         loadSummary();
//     }, []);


//     return (





//         <Box className="dashboard-container">



//             <Typography className="dashboard-title">

//                 RetailPulse Dashboard

//             </Typography>

//             <Typography className="dashboard-subtitle">

//                 Welcome, {user?.name}

//             </Typography>

//             <Grid container spacing={3}>

//                 <Grid item xs={12} md={3}>

//                     <Paper className="dashboard-card">

//                         <Typography className="card-title">

//                             Company

//                         </Typography>

//                         <Typography className="card-value">

//                             {user?.company_name || user?.company_id}

//                         </Typography>

//                     </Paper>

//                 </Grid>

//                 <Grid item xs={12} md={3}>

//                     <Paper className="dashboard-card">

//                         <Typography className="card-title">

//                             Role

//                         </Typography>

//                         <Typography className="card-value">

//                             {user?.role}

//                         </Typography>

//                     </Paper>

//                 </Grid>

//                 <Grid item xs={12} md={3}>

//                     <Paper className="dashboard-card">

//                         <Typography className="card-title">

//                             Status

//                         </Typography>

//                         <Typography className="card-value">

//                             Active

//                         </Typography>

//                     </Paper>

//                 </Grid>

//                 <Grid item xs={12} md={3}>

//                     <Paper className="dashboard-card">

//                         <Typography className="card-title">

//                             Last Login

//                         </Typography>

//                         <Typography className="card-value">
//                             {new Date().toLocaleString("en-IN", {
//                                 dateStyle: "medium",
//                                 timeStyle: "medium",
//                             })}
//                         </Typography>

//                     </Paper>

//                 </Grid>

//             </Grid>

//         </Box>

//     );

// };

// export default Dashboard;
import { useEffect, useState } from "react";
import { Paper, Typography, Grid } from "@mui/material";

import { getDashboardSummary } from "../../api/dashboardApi";

import "../auth/styles/dashboard.css";

export default function DashboardSummary() {
    const [summary, setSummary] = useState<any>({
        total_categories: 0,
        total_products: 0,
        active_products: 0,
        inactive_products: 0,
        total_stock: 0,
        inventory_value: 0
    });

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        const res = await getDashboardSummary();
        setSummary(res.data);
    };

    const cards = [
        {
            title: "Categories",
            value: summary.total_categories
        },
        {
            title: "Products",
            value: summary.total_products
        },
        {
            title: "Active Products",
            value: summary.active_products
        },
        {
            title: "Inactive Products",
            value: summary.inactive_products
        },
        {
            title: "Total Stock",
            value: summary.total_stock
        },
        {
            title: "Inventory Value",
            value: `₹${summary.inventory_value}`
        }
    ];

    return (
        <Grid
            container
            spacing={2}
            className="summary-grid"
        >
            {cards.map((card) => (
                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={2}
                    key={card.title}
                >
                    <Paper className="summary-card">
                        <Typography className="summary-title">
                            {card.title}
                        </Typography>

                        <Typography className="summary-value">
                            {card.value}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}