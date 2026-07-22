import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis
} from "recharts";

interface Props {

    inventory: any[];

}

export default function InventoryCharts({

    inventory

}: Props) {

    const statusData = [

        {

            name: "In Stock",

            value: inventory.filter(
                i => i.stock_status === "In Stock"
            ).length

        },

        {

            name: "Low Stock",

            value: inventory.filter(
                i => i.stock_status === "Low Stock"
            ).length

        },

        {

            name: "Out of Stock",

            value: inventory.filter(
                i => i.stock_status === "Out of Stock"
            ).length

        }

    ];

    const categoryMap: any = {};

    inventory.forEach((item) => {

        if (!categoryMap[item.category]) {

            categoryMap[item.category] = 0;

        }

        categoryMap[item.category] +=
            item.current_stock;

    });

    const categoryData = Object.keys(
        categoryMap
    ).map((key) => ({

        category: key,

        stock: categoryMap[key]

    }));

    const COLORS = [

        "#4CAF50",

        "#FFC107",

        "#F44336"

    ];

    return (

        <>

            <div
                style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 30
                }}
            >

                {/* Status Distribution */}

                <div
                    style={{
                        flex: 1,
                        height: 350
                    }}
                >

                    <ResponsiveContainer>

                        <PieChart>

                            <Pie

                                data={statusData}

                                dataKey="value"

                                label

                            >

                                {

                                    statusData.map(

                                        (_, index) => (

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

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

                {/* Category Stock */}

                <div
                    style={{
                        flex: 1,
                        height: 350
                    }}
                >

                    <ResponsiveContainer>

                        <BarChart
                            data={categoryData}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="category"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar
                                dataKey="stock"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </>

    );

}