import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box
} from "@mui/material";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    // PieChart,
    // Pie,
    // Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

interface Props {
    analytics: any;
}

// const COLORS = [
    // "#1976d2",
    // "#2e7d32",
    // "#ed6c02",
    // "#9c27b0",
    // "#d32f2f"
// ];

export default function CustomerAnalyticsDashboard({

    analytics

}: Props) {

    if (!analytics) return null;

    return (

        <Box mt={4}>

            <Typography
                variant="h5"
                fontWeight="bold"
                mb={3}
            >
                Customer Analytics
            </Typography>

            {/* KPI Cards */}

            <Grid container spacing={2} mb={4}>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2">
                                Total Customers
                            </Typography>

                            <Typography variant="h5">
                                {analytics.total_customers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2">
                                Active Customers
                            </Typography>

                            <Typography variant="h5">
                                {analytics.active_customers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2">
                                New Customers
                            </Typography>

                            <Typography variant="h5">
                                {analytics.new_customers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2">
                                Returning Customers
                            </Typography>

                            <Typography variant="h5">
                                {analytics.returning_customers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>


                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>

                            <Typography variant="body2">
                                Total Revenue
                            </Typography>

                            <Typography variant="h5">
                                ₹{analytics.total_revenue?.toLocaleString()}
                            </Typography>

                        </CardContent>
                    </Card>
                </Grid>


                <Grid item xs={12} sm={6} md={3}>
    <Card>
        <CardContent>
            <Typography variant="body2">
                Average Customer Spend
            </Typography>

            <Typography variant="h5">
                ₹{analytics.average_customer_spend?.toFixed(2)}
            </Typography>
        </CardContent>
    </Card>
</Grid>


<Grid item xs={12} sm={6} md={3}>
    <Card>
        <CardContent>
            <Typography variant="body2">
                Avg Purchase Frequency
            </Typography>

            <Typography variant="h5">
                {Number(
                    analytics.average_purchase_frequency || 0
                ).toFixed(2)}
            </Typography>
        </CardContent>
    </Card>
</Grid>

            </Grid>

            {/* Charts */}

            <Grid container spacing={3}>

                {/* Growth */}

                <Grid item xs={12} md={6}>

                    <Card>

                        <CardContent>

                            <Typography mb={2}>
                                Customer Growth
                            </Typography>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <LineChart
                                    data={analytics.customer_growth}
                                >

                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis dataKey="month" />

                                    <YAxis />

                                    <Tooltip />

                                    <Legend />

                                    <Line
                                        type="monotone"
                                        dataKey="customers"
                                        stroke="#1976d2"
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </CardContent>

                    </Card>

                </Grid>

                {/* New vs Returning */}

                {/* <Grid item xs={12} md={6}> */}

                    {/* <Card>

                        <CardContent>

                            <Typography mb={2}>
                                New vs Returning
                            </Typography>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <PieChart>

                                    <Pie

                                        data={
                                            analytics.new_vs_returning
                                        }

                                        dataKey="value"

                                        nameKey="name"

                                        outerRadius={100}

                                    >

                                        {

                                            analytics.new_vs_returning.map(

                                                (_: any, index: number) => (

                                                    <Cell

                                                        key={index}

                                                        fill={
                                                            COLORS[index]
                                                        }

                                                    />

                                                )

                                            )

                                        }

                                    </Pie>

                                    <Tooltip />

                                </PieChart>

                            </ResponsiveContainer>

                        </CardContent>

                    </Card> */}

                {/* </Grid> */}

                {/* Revenue */}

                <Grid item xs={12}>

                    <Card>

                        <CardContent>

                            <Typography mb={2}>
                                Revenue By Customer Type
                            </Typography>

                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >

                                <BarChart
                                    data={
                                        analytics.revenue_by_type
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="type"
                                    />

                                    <YAxis />

                                    <Tooltip />

                                    <Legend />

                                    <Bar
                                        dataKey="revenue"
                                        fill="#1976d2"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>

    );

}