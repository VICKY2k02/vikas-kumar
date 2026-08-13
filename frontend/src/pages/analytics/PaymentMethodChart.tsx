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

interface PaymentMethod {
    payment_method: string;
    transactions: number;
    revenue: number;
}

interface Props {
    data?: PaymentMethod[];
}

export default function PaymentMethodChart({
    data = []
}: Props) {

    return (
        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Payment Method Analysis
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart data={data}>

                        <XAxis
                            dataKey="payment_method"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="revenue"
                            fill="#2196f3"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>
    );
}