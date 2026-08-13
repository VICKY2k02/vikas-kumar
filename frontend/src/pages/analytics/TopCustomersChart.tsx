import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

interface Customer {
    customer: string;
    orders: number;
    total_spend: number;
    average_order_value: number;
}

interface Props {
    data?: Customer[];
}

export default function TopCustomersChart({
    data = []
}: Props) {

    return (
        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Top Customers
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart data={data}>

                        <XAxis
                            dataKey="customer"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="total_spend"
                            fill="#4caf50"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>
    );
}