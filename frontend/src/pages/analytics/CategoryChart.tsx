import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Tooltip,
    Cell
} from "recharts";

interface Props {
    data?: any[];
}

const COLORS = [
    "#1976d2",
    "#43a047",
    "#ff9800",
    "#e53935",
    "#8e24aa",
    "#00acc1"
];

export default function CategoryChart({
    data = []
}: Props) {

    return (

        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Sales by Category
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <PieChart>

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="category"
                            outerRadius={120}
                            label
                        >

                            {data.map((_, index) => (

                                <Cell
                                    key={index}
                                    fill={
                                        COLORS[
                                            index % COLORS.length
                                        ]
                                    }
                                />

                            ))}

                        </Pie>

                        <Tooltip />

                    </PieChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    );

}