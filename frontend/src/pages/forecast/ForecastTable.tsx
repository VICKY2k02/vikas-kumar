import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Typography
} from "@mui/material";

interface Forecast {
    id: number;

    product_name: string;

    current_stock: number;

    historical_sales: number;

    predicted_demand: number;

    forecast_period: string;

    confidence_score: number;

    recommendation: string;
}

interface Props {
    forecasts: Forecast[];
    loading: boolean;
}

export default function ForecastTable({
    forecasts,
    loading
}: Props) {

    const getRecommendationColor = (
        recommendation: string
    ) => {

        switch (recommendation) {

            case "Immediate Restock Required":
                return "error";

            case "Reorder Soon":
                return "warning";

            case "Healthy":
                return "success";

            case "Overstock Risk":
                return "info";

            default:
                return "default";
        }
    };

    if (loading) {
    return (
        <Paper sx={{ mt: 3, p: 3 }}>
            <Typography>Loading Forecasts...</Typography>
        </Paper>
    );
}

    return (

        <Paper sx={{ mt: 3 }}>

            <Typography
                variant="h6"
                sx={{ p: 2 }}
            >
                Product Demand Forecast
            </Typography>

            <TableContainer>

                

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                Product
                            </TableCell>

                            <TableCell align="center">
                                Current Stock
                            </TableCell>

                            <TableCell align="center">
                                Historical Sales
                            </TableCell>

                            <TableCell align="center">
                                Predicted Demand
                            </TableCell>

                            <TableCell align="center">
                                Forecast Period
                            </TableCell>

                            <TableCell align="center">
                                Confidence
                            </TableCell>

                            <TableCell align="center">
                                Recommendation
                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {forecasts.map((forecast) => (

                            <TableRow key={forecast.id} hover>

                                <TableCell>
                                    {forecast.product_name}
                                </TableCell>

                                <TableCell align="center">
                                    {forecast.current_stock}
                                </TableCell>

                                <TableCell align="center">
                                    {forecast.historical_sales}
                                </TableCell>

                                <TableCell align="center">
                                    {forecast.predicted_demand}
                                </TableCell>

                                <TableCell align="center">
                                    {forecast.forecast_period}
                                </TableCell>

                                <TableCell align="center">
                                    {forecast.confidence_score}%
                                </TableCell>

                                <TableCell align="center">

                                    <Chip
                                        label={
                                            forecast.recommendation
                                        }
                                        color={
                                            getRecommendationColor(
                                                forecast.recommendation
                                            ) as any
                                        }
                                    />

                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </TableContainer>

        </Paper>

    );
}