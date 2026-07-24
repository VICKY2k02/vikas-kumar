import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    CircularProgress
} from "@mui/material";

import Filters from "./Filters";
import KPICards from "./KPICards";
import RevenueChart from "./RevenueChart";
import SalesTrendChart from "./SalesTrendChart";
import TopProductsChart from "./TopProductsChart";
import CategoryChart from "./CategoryChart";
import InventoryChart from "./InventoryChart";
import type { DashboardResponse } from "./analytics";

import {
    getDashboardAnalytics
} from "../../api/analyticsApi";
import { getCategories } from "../../api/categoryApi";
import { getProducts } from "../../api/productApi";


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

    const [loading, setLoading] = useState(true);


    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("");
    const [salesChannel, setSalesChannel] = useState("");



    const [categories, setCategories] =
        useState<Category[]>([]);
    const [brands, setBrands] = useState<string[]>([]);

    useEffect(() => {

        loadDashboard();

    }, [
        startDate,
        endDate,
        category,
        brand,
        paymentMethod,
        salesChannel
    ]);

    useEffect(() => {

        loadCategories();
        loadBrands();

    }, []);

    const loadDashboard = async () => {

        try {

            const res = await getDashboardAnalytics({
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                category: category || undefined,
                brand: brand || undefined,
                payment_method: paymentMethod || undefined,
                sales_channel: salesChannel || undefined
            });

            setDashboard(res.data);

        }

        finally {

            setLoading(false);

        }

    };

    const loadCategories = async () => {

        const res = await getCategories();

        setCategories(res.data as Category[]);

    };

    // const loadBrands = async () => {

    //     const res: any = await getProducts();

    //     const products = res.data as any[];

    //     const uniqueBrands: string[] = [];

    // products.forEach((p) => {

    //     if (p.brand && !uniqueBrands.includes(p.brand)) {
    //         uniqueBrands.push(p.brand);
    //     }

    // });

    // setBrands(uniqueBrands);

    // };
    const loadBrands = async () => {

        const res = await getProducts();

        const products = res.data as Product[];

        const uniqueBrands = [
            ...new Set(products.map(p => p.brand))
        ];

        setBrands(uniqueBrands);

    };

if (loading) {
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
    if (loading) {
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

    return (

        <Box p={3}>

            <Typography
                variant="h4"
                mb={3}
                fontWeight="bold"
            >
                Retail Analytics Dashboard
            </Typography>

            <Filters
                startDate={startDate}
                endDate={endDate}
                category={category}
                brand={brand}
                paymentMethod={paymentMethod}
                salesChannel={salesChannel}

                categories={categories}
                brands={brands}

                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setCategory={setCategory}
                setBrand={setBrand}
                setPaymentMethod={setPaymentMethod}
                setSalesChannel={setSalesChannel}

                onRefresh={loadDashboard}
            />

            {/* <KPICards
                summary={dashboard.summary}
            />

            <RevenueChart
                data={dashboard.revenue_trend}
            />

            <SalesTrendChart
                data={dashboard.sales_trend}
            />

            <TopProductsChart
                data={dashboard.top_products}
            />

            <CategoryChart
                data={dashboard.category_distribution}
            />

            <InventoryChart
                data={dashboard.inventory_status_distribution}
            />*/}

            <KPICards
                summary={dashboard?.summary}
            />

            <RevenueChart
                data={dashboard?.revenue_trend || []}
            />

            <SalesTrendChart
                data={dashboard?.sales_trend || []}
            />

            <TopProductsChart
                data={dashboard?.top_products || []}
            />

            <CategoryChart
                data={dashboard?.category_distribution || []}
            />

            <InventoryChart
                data={dashboard?.inventory_status_distribution || []}
            />

        </Box>

    );

}