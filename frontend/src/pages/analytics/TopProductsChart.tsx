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

interface Props {
    data?: any[];
}

export default function TopProductsChart({
    data = []
}: Props) {

    return (

        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Top Selling Products
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart data={data}>

                        <XAxis dataKey="product" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="quantity"
                            fill="#ff9800"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    );

}