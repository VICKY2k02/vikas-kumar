import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Button,
    MenuItem,
    Select
} from "@mui/material";

import ForecastKPICards from "./ForecastKPICards";
import ForecastFilters from "./ForecastFilters";
import ForecastTable from "./ForecastTable";
import ForecastCharts from "./ForecastCharts";
import InventoryRecommendations from "./InventoryRecommendations";
import ForecastExportDialog from "./ForecastExportDialog";

import {
    generateForecast,
    getForecastDashboard,
    getForecasts
} from "../../api/forecastApi";

export default function ForecastDashboard() {

    const [dashboard, setDashboard] = useState<any>(null);

    const [forecasts, setForecasts] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    const [period, setPeriod] = useState<number>(30);

    const [search, setSearch] = useState("");

    const [category, setCategory] = useState("");

    const [openExport, setOpenExport] = useState(false);

    useEffect(() => {

        loadDashboard();

        loadForecasts();

    }, [period]);

    const loadDashboard = async () => {

        try {

            const data =
                await getForecastDashboard();

            setDashboard(data);

        }

        catch (err) {

            console.log(err);

        }

    };

    const loadForecasts = async () => {

        setLoading(true);

        try {

            const data = await getForecasts();

            setForecasts(data);

        }

        finally {

            setLoading(false);

        }

    };

    const handleGenerate = async () => {

        await generateForecast(period);

        loadDashboard();

        loadForecasts();

    };

    return (

        <Box p={3}>

            <Box

                display="flex"

                justifyContent="space-between"

                alignItems="center"

                mb={3}

            >

                <Typography
                    variant="h4"
                    fontWeight="bold"
                >

                    Demand Forecasting

                </Typography>

                <Box display="flex" gap={2}>

                    <Select

                        size="small"

                        value={period}

                        onChange={(e)=>setPeriod(Number(e.target.value))}

                    >

                        <MenuItem value={7}>
                            Next 7 Days
                        </MenuItem>

                        <MenuItem value={30}>
                            Next 30 Days
                        </MenuItem>

                        <MenuItem value={90}>
                            Next 90 Days
                        </MenuItem>

                    </Select>

                    <Button

                        variant="contained"

                        onClick={handleGenerate}

                    >

                        Generate Forecast

                    </Button>

                    <Button

                        variant="outlined"

                        onClick={() =>
                            setOpenExport(true)
                        }

                    >

                        Export

                    </Button>

                </Box>

            </Box>

            <ForecastKPICards
                dashboard={dashboard}
            />

            <Box mt={3}>

                <ForecastFilters

                    search={search}

                    category={category}

                    setSearch={setSearch}

                    setCategory={setCategory}

                />

            </Box>

            <Box mt={3}>

                <ForecastTable

                    forecasts={forecasts}

                    loading={loading}

                />

            </Box>

            <Box mt={4}>

                <ForecastCharts

                    dashboard={dashboard}

                />

            </Box>

            <Box mt={4}>

                <InventoryRecommendations

                    forecasts={forecasts}

                />

            </Box>

            <ForecastExportDialog

                open={openExport}

                onClose={() =>
                    setOpenExport(false)
                }

            />

        </Box>

    );

}