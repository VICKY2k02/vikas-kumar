import {
    Card,
    CardContent,
    Typography,
    Skeleton,
    Box,
    Alert
} from "@mui/material";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";


interface RevenueData {
    period: string;
    revenue: number;
}


interface Props {
    title: string;
    data?: RevenueData[];
    loading?: boolean;
}


export default function RevenuePeriodChart({
    title,
    data = [],
    loading = false
}: Props) {


    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {

        return (

            <Card sx={{ mt: 3 }}>

                <CardContent>

                    <Skeleton
                        variant="text"
                        width="220px"
                        height={35}
                    />

                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={350}
                        sx={{
                            mt: 2,
                            borderRadius: 1
                        }}
                    />

                </CardContent>

            </Card>

        );

    }


    // ============================================================
    // EMPTY STATE
    // ============================================================

    if (!data || data.length === 0) {

        return (

            <Card sx={{ mt: 3 }}>

                <CardContent>

                    <Typography
                        variant="h6"
                        mb={2}
                        fontWeight="bold"
                    >
                        {title}
                    </Typography>

                    <Box
                        sx={{
                            height: 350,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >

                        <Alert
                            severity="info"
                            sx={{
                                width: "100%",
                                maxWidth: 500
                            }}
                        >
                            No revenue data available
                            for the selected period.
                        </Alert>

                    </Box>

                </CardContent>

            </Card>

        );

    }


    // ============================================================
    // CHART
    // ============================================================

    return (

        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                    fontWeight="bold"
                >
                    {title}
                </Typography>


                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 10
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="period"
                        />

                        <YAxis />

                        <Tooltip
                            formatter={(value) => [
                                `₹${Number(value).toLocaleString("en-IN")}`,
                                "Revenue"
                            ]}
                        />

                        <Bar
                            dataKey="revenue"
                            fill="#4caf50"
                            radius={[
                                4,
                                4,
                                0,
                                0
                            ]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    );

}