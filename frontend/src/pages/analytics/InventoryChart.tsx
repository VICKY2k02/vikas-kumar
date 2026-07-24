import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip
} from "recharts";

interface Props {
    data?: any[];
}

const COLORS = [
    "#4caf50",
    "#ff9800",
    "#f44336"
];

export default function InventoryChart({
    data = []
}: Props) {

    return (

        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Inventory Status
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <PieChart>

                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="status"
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