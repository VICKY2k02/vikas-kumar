import {
    Box,
    TextField,
    MenuItem,
    Button,
    Stack
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

interface Props {
    startDate: string;
    endDate: string;

    category: string;
    brand: string;
    product: string;
    customer: string;

    paymentMethod: string;
    salesChannel: string;

    categories: any[];
    brands: string[];
    products: any[];
    customers: any[];

    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;

    setCategory: (value: string) => void;
    setBrand: (value: string) => void;

    setProduct: (value: string) => void;
    setCustomer: (value: string) => void;

    setPaymentMethod: (value: string) => void;
    setSalesChannel: (value: string) => void;

    onRefresh: () => void;

    onExport: (
        format: "csv" | "pdf"
    ) => void;
}

export default function Filters({
    startDate,
    endDate,

    category,
    brand,
    product,
    customer,

    paymentMethod,
    salesChannel,

    categories = [],
    brands = [],
    products = [],
    customers = [],

    setStartDate,
    setEndDate,

    setCategory,
    setBrand,

    setProduct,
    setCustomer,

    setPaymentMethod,
    setSalesChannel,

    onRefresh,
    onExport

}: Props) {

    // =========================================================
    // DATE PRESET HANDLER
    // =========================================================

    const handleDatePreset = (value: string) => {

        const today = new Date();

        const formatDate = (date: Date) => {

            const year = date.getFullYear();

            const month = String(
                date.getMonth() + 1
            ).padStart(2, "0");

            const day = String(
                date.getDate()
            ).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        const todayString = formatDate(today);

        // TODAY
        if (value === "today") {

            setStartDate(todayString);
            setEndDate(todayString);

            return;
        }

        // LAST 7 DAYS
        if (value === "last7") {

            const start = new Date(today);

            start.setDate(
                today.getDate() - 6
            );

            setStartDate(
                formatDate(start)
            );

            setEndDate(
                todayString
            );

            return;
        }

        // LAST 30 DAYS
        if (value === "last30") {

            const start = new Date(today);

            start.setDate(
                today.getDate() - 29
            );

            setStartDate(
                formatDate(start)
            );

            setEndDate(
                todayString
            );

            return;
        }

        // THIS MONTH
        if (value === "thisMonth") {

            const start = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

            setStartDate(
                formatDate(start)
            );

            setEndDate(
                todayString
            );

            return;
        }

        // LAST MONTH
        if (value === "lastMonth") {

            const start = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1
            );

            const end = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            );

            setStartDate(
                formatDate(start)
            );

            setEndDate(
                formatDate(end)
            );

            return;
        }

        // CUSTOM DATE RANGE
        if (value === "custom") {

            // Do not change existing dates.
            return;
        }
    };

    return (

        <Box
            display="flex"
            gap={2}
            mb={3}
            flexWrap="wrap"
            alignItems="center"
        >

            {/* =================================================
                DATE PRESET
            ================================================= */}

            <TextField
                id="analytics-date-preset"
                select
                label="Date Range"
                defaultValue="custom"
                sx={{
                    width: 180
                }}
                onChange={(e) =>
                    handleDatePreset(e.target.value)
                }
            >

                <MenuItem value="today">
                    Today
                </MenuItem>

                <MenuItem value="last7">
                    Last 7 Days
                </MenuItem>

                <MenuItem value="last30">
                    Last 30 Days
                </MenuItem>

                <MenuItem value="thisMonth">
                    This Month
                </MenuItem>

                <MenuItem value="lastMonth">
                    Last Month
                </MenuItem>

                <MenuItem value="custom">
                    Custom Date Range
                </MenuItem>

            </TextField>


            {/* =================================================
                START DATE
            ================================================= */}

            <TextField
                id="analytics-start-date"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) =>
                    setStartDate(e.target.value)
                }
                InputLabelProps={{
                    shrink: true
                }}
            />


            {/* =================================================
                END DATE
            ================================================= */}

            <TextField
                id="analytics-end-date"
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) =>
                    setEndDate(e.target.value)
                }
                InputLabelProps={{
                    shrink: true
                }}
            />


            {/* =================================================
                CATEGORY
            ================================================= */}

            <TextField
                id="analytics-category"
                select
                label="Category"
                value={category}
                sx={{
                    width: 180
                }}
                onChange={(e) =>
                    setCategory(e.target.value)
                }
            >

                <MenuItem value="">
                    All
                </MenuItem>

                {categories.map((c) => (

                    <MenuItem
                        key={c.id}
                        value={c.id}
                    >
                        {c.name}
                    </MenuItem>

                ))}

            </TextField>


            {/* =================================================
                PRODUCT
            ================================================= */}

            <TextField
                id="analytics-product"
                select
                label="Product"
                value={product}
                sx={{
                    width: 180
                }}
                onChange={(e) =>
                    setProduct(e.target.value)
                }
            >

                <MenuItem value="">
                    All
                </MenuItem>

                {products.map((p) => (

                    <MenuItem
                        key={p.id}
                        value={p.id}
                    >
                        {p.name}
                    </MenuItem>

                ))}

            </TextField>


            {/* =================================================
                CUSTOMER
            ================================================= */}

            <TextField
                id="analytics-customer"
                select
                label="Customer"
                value={customer}
                sx={{
                    width: 220
                }}
                onChange={(e) =>
                    setCustomer(e.target.value)
                }
            >

                <MenuItem value="">
                    All
                </MenuItem>

                {customers.map((c) => (

                    <MenuItem
                        key={c.id}
                        value={String(c.id)}
                    >
                        {c.full_name}
                    </MenuItem>

                ))}

            </TextField>


            {/* =================================================
                BRAND
            ================================================= */}

            <TextField
                id="analytics-brand"
                select
                label="Brand"
                value={brand}
                sx={{
                    width: 180
                }}
                onChange={(e) =>
                    setBrand(e.target.value)
                }
            >

                <MenuItem value="">
                    All
                </MenuItem>

                {brands.map((b) => (

                    <MenuItem
                        key={b}
                        value={b}
                    >
                        {b}
                    </MenuItem>

                ))}

            </TextField>


            {/* =================================================
                PAYMENT METHOD
            ================================================= */}

            <TextField
                id="analytics-payment-method"
                select
                label="Payment"
                value={paymentMethod}
                sx={{
                    width: 180
                }}
                onChange={(e) =>
                    setPaymentMethod(e.target.value)
                }
            >

                <MenuItem value="">
                    All
                </MenuItem>

                <MenuItem value="Cash">
                    Cash
                </MenuItem>

                <MenuItem value="Card">
                    Card
                </MenuItem>

                <MenuItem value="UPI">
                    UPI
                </MenuItem>

                <MenuItem value="Bank Transfer">
                    Bank Transfer
                </MenuItem>

                <MenuItem value="Other">
                    Other
                </MenuItem>

            </TextField>


            {/* =================================================
                SALES CHANNEL
            ================================================= */}

            <TextField
                id="analytics-sales-channel"
                select
                label="Channel"
                value={salesChannel}
                sx={{
                    width: 180
                }}
                onChange={(e) =>
                    setSalesChannel(e.target.value)
                }
            >

                <MenuItem value="">
                    All
                </MenuItem>

                <MenuItem value="Store">
                    Store
                </MenuItem>

                <MenuItem value="Online">
                    Online
                </MenuItem>

            </TextField>


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
            >

                <Button
                    variant="contained"
                    onClick={onRefresh}
                >
                    Refresh
                </Button>

                <Button
                    variant="outlined"
                    startIcon={
                        <DownloadIcon />
                    }
                    onClick={() =>
                        onExport("csv")
                    }
                >
                    Export CSV
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    startIcon={
                        <PictureAsPdfIcon />
                    }
                    onClick={() =>
                        onExport("pdf")
                    }
                >
                    Export PDF
                </Button>

            </Stack>

        </Box>
    );
}