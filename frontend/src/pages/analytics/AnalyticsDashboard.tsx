import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Alert,
    Button
} from "@mui/material";

import Filters from "./Filters";
import KPICards from "./KPICards";
import RevenuePeriodChart from "./RevenuePeriodChart";
import SalesTrendChart from "./SalesTrendChart";
import SalesVsOrdersChart from "./SalesVsOrdersChart";
import TopProductsChart from "./TopProductsChart";
import TopCustomersChart from "./TopCustomersChart";
import PaymentMethodChart from "./PaymentMethodChart";
import CategoryChart from "./CategoryChart";
import InventoryChart from "./InventoryChart";

import type { DashboardResponse } from "./analytics";

import {
    getDashboardAnalytics,
    exportAnalytics
} from "../../api/analyticsApi";

import { getCategories } from "../../api/categoryApi";
import { getProducts } from "../../api/productApi";
import { getCustomers } from "../../api/customerApi";


interface Product {
    id: number;
    name: string;
    brand: string;
}

interface Category {
    id: number;
    name: string;
}


export default function AnalyticsDashboard() {

    // ============================================================
    // STATES
    // ============================================================

    const [loading, setLoading] = useState(true);

    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);

    const [error, setError] = useState("");

    const [exportLoading, setExportLoading] =
        useState<"csv" | "pdf" | null>(null);

    const [exportError, setExportError] =
        useState("");


    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("");

    const [salesChannel, setSalesChannel] =
        useState("");

    const [product, setProduct] = useState("");
    const [customer, setCustomer] = useState("");


    // Filter options
    const [products, setProducts] =
        useState<Product[]>([]);

    const [customers, setCustomers] =
        useState<any[]>([]);

    const [categories, setCategories] =
        useState<Category[]>([]);

    const [brands, setBrands] =
        useState<string[]>([]);


    // Revenue period
    const [revenuePeriod, setRevenuePeriod] =
        useState<
            "daily" | "weekly" | "monthly"
        >("daily");


    // ============================================================
    // LOAD DASHBOARD WHEN FILTERS CHANGE
    // ============================================================

    useEffect(() => {

        loadDashboard();

    }, [
        startDate,
        endDate,
        category,
        brand,
        product,
        customer,
        paymentMethod,
        salesChannel
    ]);


    // ============================================================
    // LOAD FILTER OPTIONS
    // ============================================================

    useEffect(() => {

        loadCategories();
        loadBrands();
        loadCustomers();

    }, []);


    // ============================================================
    // LOAD DASHBOARD
    // ============================================================

    const loadDashboard = async () => {

        // Clear previous error
        setError("");

        // --------------------------------------------------------
        // DATE VALIDATION
        // --------------------------------------------------------

        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {

            setDashboard(null);

            setError(
                "Start date cannot be later than end date."
            );

            setLoading(false);

            return;
        }


        setLoading(true);


        try {

            const res =
                await getDashboardAnalytics({

                    start_date:
                        startDate || undefined,

                    end_date:
                        endDate || undefined,

                    category:
                        category || undefined,

                    brand:
                        brand || undefined,

                    product:
                        product || undefined,

                    customer:
                        customer || undefined,

                    payment_method:
                        paymentMethod || undefined,

                    sales_channel:
                        salesChannel || undefined

                });


            setDashboard(res.data);

        }

        catch (error) {

            console.error(
                "Failed to load analytics:",
                error
            );

            setDashboard(null);

            setError(
                "Failed to load analytics data. Please try again."
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ============================================================
    // LOAD CATEGORIES
    // ============================================================

    const loadCategories = async () => {

        try {

            const res =
                await getCategories();

            setCategories(
                res.data as Category[]
            );

        }

        catch (error) {

            console.error(
                "Failed to load categories:",
                error
            );

            setCategories([]);

        }

    };


    // ============================================================
    // LOAD CUSTOMERS
    // ============================================================

    const loadCustomers = async () => {

        try {

            const data =
                await getCustomers();

            setCustomers(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (error) {

            console.error(
                "Failed to load customers:",
                error
            );

            setCustomers([]);

        }

    };


    // ============================================================
    // LOAD PRODUCTS + BRANDS
    // ============================================================

    const loadBrands = async () => {

        try {

            const res =
                await getProducts();

            const productsData =
                res.data as Product[];

            setProducts(productsData);


            const uniqueBrands = [
                ...new Set(
                    productsData
                        .map(
                            product =>
                                product.brand
                        )
                        .filter(Boolean)
                )
            ];


            setBrands(uniqueBrands);

        }

        catch (error) {

            console.error(
                "Failed to load products:",
                error
            );

            setProducts([]);
            setBrands([]);

        }

    };


    // ============================================================
    // REVENUE PERIOD CHANGE
    // ============================================================

    const handleRevenuePeriodChange = (

        _event:
            React.MouseEvent<HTMLElement>,

        value:
            "daily"
            | "weekly"
            | "monthly"
            | null

    ) => {

        if (value) {

            setRevenuePeriod(value);

        }

    };


    // ============================================================
    // REVENUE DATA
    // ============================================================

    const revenueData =
        revenuePeriod === "daily"

            ? dashboard?.revenue_trend || []

            : revenuePeriod === "weekly"

                ? dashboard?.weekly_revenue || []

                : dashboard?.monthly_revenue || [];


    // ============================================================
    // CHECK WHETHER SALES DATA EXISTS
    // ============================================================

    const hasSalesData =
        Boolean(
            dashboard &&
            (
                (dashboard.summary?.total_orders ?? 0) > 0
                ||
                (dashboard.summary?.total_revenue ?? 0) > 0
                ||
                (dashboard.revenue_trend?.length ?? 0) > 0
                ||
                (dashboard.top_products?.length ?? 0) > 0
            )
        );


    // ============================================================
    // EXPORT ANALYTICS
    // ============================================================

    const handleExport = async (
        format: "csv" | "pdf"
    ) => {

        setExportError("");

        // --------------------------------------------------------
        // DATE VALIDATION
        // --------------------------------------------------------

        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {

            setExportError(
                "Start date cannot be later than end date."
            );

            return;

        }


        setExportLoading(format);


        try {

            const res =
                await exportAnalytics(

                    format,

                    {

                        start_date:
                            startDate || undefined,

                        end_date:
                            endDate || undefined,

                        category:
                            category || undefined,

                        brand:
                            brand || undefined,

                        product:
                            product || undefined,

                        customer:
                            customer || undefined,

                        payment_method:
                            paymentMethod || undefined,

                        sales_channel:
                            salesChannel || undefined

                    }

                );


            const url =
                window.URL.createObjectURL(
                    new Blob([res.data])
                );


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                `analytics.${format}`;


            document.body.appendChild(link);

            link.click();

            link.remove();


            window.URL.revokeObjectURL(url);

        }

        catch (error) {

            console.error(
                `Failed to export ${format}:`,
                error
            );

            setExportError(
                `Failed to export ${format.toUpperCase()} report. Please try again.`
            );

        }

        finally {

            setExportLoading(null);

        }

    };


    // ============================================================
    // INITIAL LOADING
    // ============================================================

    if (loading && !dashboard) {

        return (

            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="80vh"
            >

                <CircularProgress />

            </Box>

        );

    }


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <Box p={3}>

            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <Typography
                variant="h4"
                mb={3}
                fontWeight="bold"
            >
                Retail Analytics Dashboard
            </Typography>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={

                        <Button
                            color="inherit"
                            size="small"
                            onClick={loadDashboard}
                        >
                            Retry
                        </Button>

                    }
                >
                    {error}
                </Alert>

            )}


            {/* =================================================
                EXPORT ERROR
            ================================================= */}

            {exportError && (

                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() =>
                        setExportError("")
                    }
                >
                    {exportError}
                </Alert>

            )}


            {/* =================================================
                FILTERS
            ================================================= */}

            <Filters

                startDate={startDate}
                endDate={endDate}

                category={category}
                brand={brand}

                product={product}
                customer={customer}

                paymentMethod={paymentMethod}
                salesChannel={salesChannel}


                categories={categories}
                brands={brands}

                products={products}
                customers={customers}


                setStartDate={setStartDate}
                setEndDate={setEndDate}

                setCategory={setCategory}
                setBrand={setBrand}

                setProduct={setProduct}
                setCustomer={setCustomer}

                setPaymentMethod={
                    setPaymentMethod
                }

                setSalesChannel={
                    setSalesChannel
                }


                onRefresh={
                    loadDashboard
                }

                onExport={
                    handleExport
                }

            />


            {/* =================================================
                EXPORT LOADING MESSAGE
            ================================================= */}

            {exportLoading && (

                <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={2}
                >

                    <CircularProgress
                        size={20}
                    />

                    <Typography
                        variant="body2"
                    >
                        Preparing{" "}
                        {exportLoading.toUpperCase()}{" "}
                        report...
                    </Typography>

                </Box>

            )}


            {/* =================================================
                NO DATA STATE
            ================================================= */}

            {!error && !hasSalesData && (

                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                >
                    No sales data available for
                    the selected period or filters.
                </Alert>

            )}


            {/* =================================================
                KPI CARDS
            ================================================= */}

            {dashboard && (

                <KPICards
                    summary={
                        dashboard.summary
                    }
                />

            )}


            {/* =================================================
                SALES OVERVIEW
            ================================================= */}

            <Box sx={{ mt: 3 }}>

                <Typography
                    variant="h5"
                    fontWeight="bold"
                    mb={2}
                >
                    Sales Overview
                </Typography>


                <ToggleButtonGroup

                    value={revenuePeriod}

                    exclusive

                    onChange={
                        handleRevenuePeriodChange
                    }

                    size="small"

                    sx={{ mb: 2 }}

                >

                    <ToggleButton
                        value="daily"
                    >
                        Daily
                    </ToggleButton>


                    <ToggleButton
                        value="weekly"
                    >
                        Weekly
                    </ToggleButton>


                    <ToggleButton
                        value="monthly"
                    >
                        Monthly
                    </ToggleButton>

                </ToggleButtonGroup>


                {revenueData.length > 0 ? (

                    <RevenuePeriodChart

                        title={

                            revenuePeriod === "daily"

                                ? "Daily Revenue"

                                : revenuePeriod === "weekly"

                                    ? "Weekly Revenue"

                                    : "Monthly Revenue"

                        }

                        data={revenueData}

                        loading={loading}

                    />

                ) : (

                    <Alert severity="info">

                        No revenue data available
                        for this period.

                    </Alert>

                )}

            </Box>


            {/* =================================================
                OTHER ANALYTICS
            ================================================= */}

            {dashboard && (

                <>

                    <SalesTrendChart
                        data={
                            dashboard.sales_trend || []
                        }
                    />


                    <SalesVsOrdersChart
                        data={
                            dashboard.sales_vs_orders || []
                        }
                    />


                    <TopProductsChart
                        data={
                            dashboard.top_products || []
                        }
                    />


                    <TopCustomersChart
                        data={
                            dashboard.top_customers || []
                        }
                    />


                    <PaymentMethodChart
                        data={
                            dashboard.payment_method_analysis || []
                        }
                    />


                    <CategoryChart
                        data={
                            dashboard.category_distribution || []
                        }
                    />


                    <InventoryChart
                        data={
                            dashboard.inventory_status_distribution || []
                        }
                    />

                </>

            )}

        </Box>

    );

}