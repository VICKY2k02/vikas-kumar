import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from "recharts";

interface SalesVsOrders {
    date: string;
    revenue: number;
    orders: number;
}

interface Props {
    data?: SalesVsOrders[];
}

export default function SalesVsOrdersChart({
    data = []
}: Props) {

    return (
        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Sales vs Orders
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <LineChart data={data}>

                        <XAxis
                            dataKey="date"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#2196f3"
                            strokeWidth={3}
                        />

                        <Line
                            type="monotone"
                            dataKey="orders"
                            name="Orders"
                            stroke="#ff9800"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>
    );
}