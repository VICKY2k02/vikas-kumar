import { useEffect, useState } from "react";

import {
    getInventoryByCategory,
    getStockStatus
} from "../../api/dashboardApi";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import {
    Grid,
    Paper,
    Typography
} from "@mui/material";

const COLORS = [
    "#1976d2",
    "#43a047",
    "#ef5350",
    "#ffa726",
    "#7e57c2",
    "#26c6da"
];

export default function DashboardCharts() {


const [categoryData, setCategoryData] = useState([]);

const [stockStatus, setStockStatus] = useState([]);

useEffect(() => {
    loadCharts();
}, []);

const loadCharts = async () => {

    const category = await getInventoryByCategory();

    console.log(category.data);

    setCategoryData(category.data);

    const stock = await getStockStatus();

    setStockStatus(stock.data);

};



    return (

        <Grid
            container
            spacing={3}
            sx={{ mt: 2 }}
        >

            {/* Inventory By Category */}

            <Grid item xs={12} md={7}>

                <Paper sx={{ p: 2 }}>

                    <Typography
                        variant="h6"
                        mb={2}
                    >
                        Inventory By Category
                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <BarChart
                            data={categoryData}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis dataKey="category" />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="stock"
                                fill="#1976d2"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </Paper>

            </Grid>

            {/* Stock Distribution */}

            <Grid item xs={12} md={5}>

                <Paper sx={{ p: 2 }}>

                    <Typography
                        variant="h6"
                        mb={2}
                    >
                        Stock Status Distribution
                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <PieChart>

                            <Pie
                                data={stockStatus}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={120}
                                label
                            >

                                {
                                    stockStatus.map(
                                        (_, index) => (
                                            <Cell
                                                key={index}
                                                fill={COLORS[index]}
                                            />
                                        )
                                    )
                                }

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </Paper>

            </Grid>

        </Grid>

    );

}