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
    CartesianGrid
} from "recharts";

interface Props {
    data?: any[];
}

export default function RevenueChart({
    data = []
}: Props) {

    return (

        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Revenue Trend
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <LineChart data={data}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="date" />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#1976d2"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    );

}