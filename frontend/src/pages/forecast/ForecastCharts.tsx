import {
    Paper,
    Typography,
    Grid
} from "@mui/material";

import {

    ResponsiveContainer,

    LineChart,

    Line,

    CartesianGrid,

    XAxis,

    YAxis,

    Tooltip,

    Legend,

    BarChart,

    Bar,

    PieChart,

    Pie,

    Cell

} from "recharts";

interface Props{

    dashboard:any;

}

const COLORS=[

    "#1976d2",

    "#43a047",

    "#fb8c00",

    "#8e24aa",

    "#d32f2f"

];

export default function ForecastCharts({

    dashboard

}:Props){

    return(

        <Grid container spacing={3} mt={1}>

            {/* Historical vs Forecast */}

            <Grid item xs={12} md={6}>

                <Paper sx={{p:2}}>

                    <Typography
                        variant="h6"
                        mb={2}
                    >

                        Historical Sales vs Forecast

                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart

                            data={
                                dashboard?.historical_vs_forecast || []
                            }

                        >

                            <CartesianGrid strokeDasharray="3 3"/>

                            <XAxis dataKey="month"/>

                            <YAxis/>

                            <Tooltip/>

                            <Legend/>

                            <Line

                                type="monotone"

                                dataKey="historical"

                                stroke="#1976d2"

                            />

                            <Line

                                type="monotone"

                                dataKey="forecast"

                                stroke="#43a047"

                            />

                        </LineChart>

                    </ResponsiveContainer>

                </Paper>

            </Grid>

            {/* Product Trend */}

            <Grid item xs={12} md={6}>

                <Paper sx={{p:2}}>

                    <Typography
                        variant="h6"
                        mb={2}
                    >

                        Product Demand Trend

                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart

                            data={
                                dashboard?.product_trend || []
                            }

                        >

                            <CartesianGrid strokeDasharray="3 3"/>

                            <XAxis dataKey="product"/>

                            <YAxis/>

                            <Tooltip/>

                            <Legend/>

                            <Bar

                                dataKey="predicted"

                                fill="#1976d2"

                            />

                        </BarChart>

                    </ResponsiveContainer>

                </Paper>

            </Grid>

            {/* Category Trend */}

            <Grid item xs={12} md={6}>

                <Paper sx={{p:2}}>

                    <Typography
                        variant="h6"
                        mb={2}
                    >

                        Category Demand Trend

                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart

                            data={
                                dashboard?.category_trend || []
                            }

                        >

                            <CartesianGrid strokeDasharray="3 3"/>

                            <XAxis dataKey="category"/>

                            <YAxis/>

                            <Tooltip/>

                            <Legend/>

                            <Bar

                                dataKey="predicted"

                                fill="#43a047"

                            />

                        </BarChart>

                    </ResponsiveContainer>

                </Paper>

            </Grid>

            {/* Top Products */}

            <Grid item xs={12} md={6}>

                <Paper sx={{p:2}}>

                    <Typography
                        variant="h6"
                        mb={2}
                    >

                        Top Predicted Products

                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <PieChart>

                            <Pie

                                data={
                                    dashboard?.top_products || []
                                }

                                dataKey="predicted"

                                nameKey="product"

                                outerRadius={100}

                                label

                            >

                                {

                                    dashboard?.top_products?.map(

                                        (_:any,index:number)=>(

                                            <Cell

                                                key={index}

                                                fill={
                                                    COLORS[
                                                        index%COLORS.length
                                                    ]
                                                }

                                            />

                                        )

                                    )

                                }

                            </Pie>

                            <Tooltip/>

                        </PieChart>

                    </ResponsiveContainer>

                </Paper>

            </Grid>

            {/* Seasonal Pattern */}

            <Grid item xs={12}>

                <Paper sx={{p:2}}>

                    <Typography
                        variant="h6"
                        mb={2}
                    >

                        Seasonal Sales Pattern

                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart

                            data={
                                dashboard?.seasonal_pattern || []
                            }

                        >

                            <CartesianGrid strokeDasharray="3 3"/>

                            <XAxis dataKey="month"/>

                            <YAxis/>

                            <Tooltip/>

                            <Legend/>

                            <Line

                                type="monotone"

                                dataKey="sales"

                                stroke="#8e24aa"

                            />

                        </LineChart>

                    </ResponsiveContainer>

                </Paper>

            </Grid>

        </Grid>

    );

}