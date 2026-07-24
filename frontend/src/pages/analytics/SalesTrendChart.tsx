import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

interface Props {
    data?: any[];
}

export default function SalesTrendChart({
    data = []
}: Props) {

    return (

        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Sales Trend
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <AreaChart data={data}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="date" />

                        <YAxis />

                        <Tooltip />

                        <Area

                            type="monotone"

                            dataKey="orders"

                            fill="#4caf50"

                            stroke="#4caf50"

                        />

                    </AreaChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    );

}