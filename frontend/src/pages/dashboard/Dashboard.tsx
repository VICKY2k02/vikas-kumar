import { useEffect, useState } from "react";
import { Paper, Typography, Grid } from "@mui/material";

import { getDashboardSummary } from "../../api/dashboardApi";

import "../auth/styles/dashboard.css";
import DashboardCharts from "./DashboardCharts";
import ProfileCard from "./ProfileCard";

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
        <>
        <ProfileCard />
        
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
        <DashboardCharts />

        </>
    );
}