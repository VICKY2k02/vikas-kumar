import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    // SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";

import {
    getInventoryForecast,
    getInventoryForecastSummary,
    getInventoryRecommendation
} from "../../api/inventoryForecastApi";

import "./InventoryForecast.css";


interface ForecastItem {

    product_id: number;

    product: string;

    sku: string;

    category: string;

    current_stock: number;

    available_stock: number;

    historical_sales: number;

    average_daily_sales: number;

    forecasted_demand: number;

    forecast_days: number;

    lead_time_days: number;

    safety_stock: number;

    reorder_point: number;

    days_of_stock_remaining:
    number | null;

    recommended_reorder_quantity: number;

    stock_risk: string;

    reorder_required: boolean;

    recommendation: string;
}


const emptySummary = {

    total_products: 0,

    products_requiring_reorder: 0,

    stockout_risk: 0,

    out_of_stock: 0,

    low_stock: 0,

    overstocked: 0,

    healthy: 0,

    no_sales_history: 0,

    total_forecasted_demand: 0,

    total_recommended_quantity: 0
};


export default function InventoryForecast() {

    const [items, setItems] =
        useState<ForecastItem[]>([]);

    const [summary, setSummary] =
        useState(emptySummary);

    const [selected, setSelected] =
        useState<ForecastItem | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [detailLoading, setDetailLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [risk, setRisk] =
        useState("");

    const [reorderRequired, setReorderRequired] =
        useState("");

    const [sortBy, setSortBy] =
        useState("days_remaining");



    const [forecastDays, setForecastDays] =
        useState(30);


    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const params: any = {
                forecast_days: forecastDays,
                search,
                risk,
                sort_by: sortBy,
                sort_order: "asc",
            };

            // Search
            if (search.trim() !== "") {
                params.search = search.trim();
            }

            // Category
            if (category.trim() !== "") {
                params.category = Number(category);
            }

            // Risk
            if (risk !== "") {
                params.risk = risk;
            }

            // Reorder
            if (reorderRequired !== "") {
                params.reorder_required =
                    reorderRequired === "true";
            }

            // Sort
            if (sortBy !== "") {
                params.sort_by = sortBy;
            }

            console.log("FORECAST PARAMS:", params);

            const [
                forecastRes,
                summaryRes
            ] = await Promise.all([
                getInventoryForecast(params),

                getInventoryForecastSummary({
                    forecast_days: forecastDays
                })
            ]);

            console.log(
                "FORECAST RESPONSE:",
                forecastRes.data
            );

            setItems(
                forecastRes.data?.items || []
            );

            setSummary(
                summaryRes.data || emptySummary
            );

        } catch (err: any) {

            console.error(
                "FORECAST ERROR:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load inventory forecast."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadData();

    }, [
        search,
        category,
        risk,
        reorderRequired,
        sortBy,
        forecastDays
    ]);


    const handleSelect = async (
        item: ForecastItem
    ) => {

        setSelected(item);
        setDetailLoading(true);

        try {

            const response =
                await getInventoryRecommendation(
                    item.product_id,
                    {
                        forecast_days:
                            forecastDays
                    }
                );

            setSelected(
                response.data
            );

        } catch (err) {

            console.error(err);

        } finally {

            setDetailLoading(false);

        }
    };


    const riskColor = (
        value: string
    ): any => {

        switch (value) {

            case "Out of Stock":
                return "error";

            case "Stockout Risk":
                return "error";

            case "Low Stock":
                return "warning";

            case "Overstock":
                return "info";

            default:
                return "success";
        }
    };


    const formatNumber = (
        value: number | null
    ) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        return Number(value).toFixed(2);
    };


    return (

        <Box className="inventory-forecast-page">

            <Box className="forecast-header">

                <Box>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Inventory Forecast &
                        Smart Replenishment
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Predict future demand and
                        identify inventory actions.
                    </Typography>

                </Box>

                <FormControl
                    size="small"
                    sx={{ minWidth: 160 }}
                >

                    <InputLabel>
                        Forecast Period
                    </InputLabel>

                    <Select
                        value={String(forecastDays)}
                        label="Forecast Period"
                        onChange={(
                            e: SelectChangeEvent
                        ) =>
                            setForecastDays(
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    >

                        <MenuItem value="7">
                            7 Days
                        </MenuItem>

                        <MenuItem value="14">
                            14 Days
                        </MenuItem>

                        <MenuItem value="30">
                            30 Days
                        </MenuItem>

                        <MenuItem value="60">
                            60 Days
                        </MenuItem>

                        <MenuItem value="90">
                            90 Days
                        </MenuItem>

                    </Select>

                </FormControl>

            </Box>


            {error && (

                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>

            )}


            {/* SUMMARY */}

            <Box className="forecast-summary">

                <Card>
                    <CardContent>

                        <Typography>
                            Reorder Required
                        </Typography>

                        <Typography variant="h4">
                            {
                                summary
                                    .products_requiring_reorder
                            }
                        </Typography>

                    </CardContent>
                </Card>


                <Card>
                    <CardContent>

                        <Typography>
                            Stockout Risk
                        </Typography>

                        <Typography variant="h4">
                            {
                                summary.stockout_risk
                            }
                        </Typography>

                    </CardContent>
                </Card>


                <Card>
                    <CardContent>

                        <Typography>
                            Overstocked
                        </Typography>

                        <Typography variant="h4">
                            {
                                summary.overstocked
                            }
                        </Typography>

                    </CardContent>
                </Card>


                <Card>
                    <CardContent>

                        <Typography>
                            Healthy
                        </Typography>

                        <Typography variant="h4">
                            {
                                summary.healthy
                            }
                        </Typography>

                    </CardContent>
                </Card>

            </Box>


            {/* FILTERS */}

            <Paper
                className="forecast-filters"
                sx={{ p: 2, mb: 2 }}
            >

                <TextField
                    size="small"
                    label="Product / SKU"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                <TextField
                    size="small"
                    label="Category ID"
                    value={category}
                    onChange={(e) =>
                        setCategory(
                            e.target.value
                        )
                    }
                />


                <FormControl
                    size="small"
                >

                    <InputLabel>
                        Stock Risk
                    </InputLabel>

                    <Select
                        value={risk}
                        label="Stock Risk"
                        onChange={(e) =>
                            setRisk(
                                e.target.value
                            )
                        }
                    >

                        <MenuItem value="">
                            All
                        </MenuItem>

                        <MenuItem value="Out of Stock">
                            Out of Stock
                        </MenuItem>

                        <MenuItem value="Stockout Risk">
                            Stockout Risk
                        </MenuItem>

                        <MenuItem value="Low Stock">
                            Low Stock
                        </MenuItem>

                        <MenuItem value="Healthy">
                            Healthy
                        </MenuItem>

                        <MenuItem value="Overstock">
                            Overstock
                        </MenuItem>

                    </Select>

                </FormControl>


                <FormControl
                    size="small"
                >

                    <InputLabel>
                        Reorder
                    </InputLabel>

                    <Select
                        value={reorderRequired}
                        label="Reorder"
                        onChange={(e) =>
                            setReorderRequired(
                                e.target.value
                            )
                        }
                    >

                        <MenuItem value="">
                            All
                        </MenuItem>

                        <MenuItem value="true">
                            Required
                        </MenuItem>

                        <MenuItem value="false">
                            Not Required
                        </MenuItem>

                    </Select>

                </FormControl>


                <FormControl
                    size="small"
                >

                    <InputLabel>
                        Sort By
                    </InputLabel>

                    <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) =>
                            setSortBy(
                                e.target.value
                            )
                        }
                    >

                        <MenuItem value="current_stock">
                            Current Stock
                        </MenuItem>

                        <MenuItem value="forecasted_demand">
                            Forecasted Demand
                        </MenuItem>

                        <MenuItem value="days_remaining">
                            Days Remaining
                        </MenuItem>

                        <MenuItem value="recommended_quantity">
                            Recommended Quantity
                        </MenuItem>

                        <MenuItem value="risk">
                            Risk
                        </MenuItem>

                        <MenuItem value="product">
                            Product
                        </MenuItem>

                    </Select>

                </FormControl>


                <Button
                    variant="outlined"
                    onClick={() =>
                        loadData()
                    }
                >
                    Refresh
                </Button>

            </Paper>


            {/* TABLE + DETAIL */}

            <Box className="forecast-content">

                <TableContainer
                    component={Paper}
                    className="forecast-table"
                >

                    {loading ? (

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "center",
                                p: 8
                            }}
                        >

                            <CircularProgress />

                        </Box>

                    ) : items.length === 0 ? (

                        <Box
                            sx={{
                                textAlign: "center",
                                p: 8
                            }}
                        >

                            <Typography
                                variant="h6"
                            >
                                No forecast data
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                No products match the
                                selected filters or
                                there is no inventory
                                history yet.
                            </Typography>

                        </Box>

                    ) : (

                        <Table
                            size="small"
                            stickyHeader
                        >

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        Product
                                    </TableCell>

                                    <TableCell>
                                        SKU
                                    </TableCell>

                                    <TableCell>
                                        Current Stock
                                    </TableCell>

                                    <TableCell>
                                        Avg Daily Sales
                                    </TableCell>

                                    <TableCell>
                                        Forecast Demand
                                    </TableCell>

                                    <TableCell>
                                        Days Remaining
                                    </TableCell>

                                    <TableCell>
                                        Reorder Point
                                    </TableCell>

                                    <TableCell>
                                        Recommended Qty
                                    </TableCell>

                                    <TableCell>
                                        Risk
                                    </TableCell>

                                    <TableCell>
                                        Recommendation
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {items.map(
                                    (item) => (

                                        <TableRow
                                            key={
                                                item.product_id
                                            }
                                            hover
                                            selected={
                                                selected
                                                    ?.product_id
                                                ===
                                                item.product_id
                                            }
                                            onClick={() =>
                                                handleSelect(
                                                    item
                                                )
                                            }
                                            sx={{
                                                cursor:
                                                    "pointer"
                                            }}
                                        >

                                            <TableCell>
                                                {item.product}
                                            </TableCell>

                                            <TableCell>
                                                {item.sku ||
                                                    "-"}
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.current_stock
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    formatNumber(
                                                        item.average_daily_sales
                                                    )
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    formatNumber(
                                                        item.forecasted_demand
                                                    )
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.days_of_stock_remaining ===
                                                        null
                                                        ? "∞"
                                                        : formatNumber(
                                                            item.days_of_stock_remaining
                                                        )
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    formatNumber(
                                                        item.reorder_point
                                                    )
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    fontWeight={
                                                        item.recommended_reorder_quantity >
                                                            0
                                                            ? 700
                                                            : 400
                                                    }
                                                    color={
                                                        item.recommended_reorder_quantity >
                                                            0
                                                            ? "error.main"
                                                            : "text.primary"
                                                    }
                                                >
                                                    {
                                                        item.recommended_reorder_quantity
                                                    }
                                                </Typography>
                                            </TableCell>

                                            <TableCell>

                                                <Chip
                                                    size="small"
                                                    label={
                                                        item.stock_risk
                                                    }
                                                    color={
                                                        riskColor(
                                                            item.stock_risk
                                                        )
                                                    }
                                                />

                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.recommendation
                                                }
                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    )}

                </TableContainer>


                {/* COMPARISON PANEL */}

                <Paper
                    className="forecast-detail"
                    sx={{ p: 3 }}
                >

                    {!selected ? (

                        <Box
                            sx={{
                                textAlign:
                                    "center",
                                py: 8
                            }}
                        >

                            <Typography
                                variant="h6"
                            >
                                Select a product
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                Click a forecast row to
                                view the recommendation
                                comparison.
                            </Typography>

                        </Box>

                    ) : detailLoading ? (

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "center",
                                py: 8
                            }}
                        >

                            <CircularProgress />

                        </Box>

                    ) : (

                        <>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {selected.product}
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                {selected.sku}
                            </Typography>

                            <Divider
                                sx={{ my: 2 }}
                            />


                            <Typography
                                fontWeight={700}
                                mb={2}
                            >
                                Inventory Comparison
                            </Typography>


                            <Box className="comparison-row">

                                <Typography>
                                    Stock
                                </Typography>

                                <Typography>
                                    {selected.current_stock}
                                    {" → "}
                                    {
                                        selected.current_stock +
                                        selected.recommended_reorder_quantity
                                    }
                                </Typography>

                            </Box>


                            <Box className="comparison-row">

                                <Typography>
                                    Daily Demand
                                </Typography>

                                <Typography>
                                    {
                                        formatNumber(
                                            selected.average_daily_sales
                                        )
                                    }
                                </Typography>

                            </Box>


                            <Box className="comparison-row">

                                <Typography>
                                    Reorder Point
                                </Typography>

                                <Typography>
                                    {
                                        formatNumber(
                                            selected.reorder_point
                                        )
                                    }
                                </Typography>

                            </Box>


                            <Box className="comparison-row">

                                <Typography>
                                    Safety Stock
                                </Typography>

                                <Typography>
                                    {
                                        formatNumber(
                                            selected.safety_stock
                                        )
                                    }
                                </Typography>

                            </Box>


                            <Box className="comparison-row">

                                <Typography>
                                    Forecast Demand
                                </Typography>

                                <Typography>
                                    {
                                        formatNumber(
                                            selected.forecasted_demand
                                        )
                                    }
                                </Typography>

                            </Box>


                            <Divider
                                sx={{ my: 2 }}
                            />


                            <Chip
                                label={
                                    selected.stock_risk
                                }
                                color={
                                    riskColor(
                                        selected.stock_risk
                                    )
                                }
                                sx={{
                                    mb: 2
                                }}
                            />


                            <Alert
                                severity={
                                    selected.reorder_required
                                        ? "warning"
                                        : "success"
                                }
                            >
                                {
                                    selected.recommendation
                                }
                            </Alert>


                            <Box sx={{ mt: 2 }}>

                                <Typography
                                    fontWeight={700}
                                >
                                    Recommended
                                    Reorder Quantity
                                </Typography>

                                <Typography
                                    variant="h4"
                                    color={
                                        selected.recommended_reorder_quantity >
                                            0
                                            ? "error.main"
                                            : "success.main"
                                    }
                                >
                                    {
                                        selected.recommended_reorder_quantity
                                    }
                                </Typography>

                            </Box>

                        </>

                    )}

                </Paper>

            </Box>

        </Box>
    );
}