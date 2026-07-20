import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import SalesTable from "./SalesTable";
import AddSaleDialog from "./AddSaleDialog";
import EditSaleDialog from "./EditSaleDialog";
import SaleDetailsDialog from "./SaleDetailsDialog";

import {
    getSales,
    deleteSale,
    dashboardSummary
} from "../../api/salesApi";

import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";

import "../auth/styles/Sales.css";

export default function Sales() {

    const [sales, setSales] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [summary, setSummary] = useState({

        total_sales: 0,

        total_revenue: 0,

        total_orders: 0,

        average_order_value: 0

    });

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState<number | "">("");

    const [channelFilter, setChannelFilter] =
        useState("");

    const [paymentFilter, setPaymentFilter] =
        useState("");

    const [openAdd, setOpenAdd] =
        useState(false);

    const [openEdit, setOpenEdit] =
        useState(false);

    const [openDetails, setOpenDetails] =
        useState(false);

    const [selectedSale, setSelectedSale] =
        useState<any>(null);

    useEffect(() => {

        loadSales();

        loadProducts();

        loadCategories();

        loadSummary();

    }, []);


    useEffect(() => {

        loadSales();

    }, [
        search,
        categoryFilter,
        channelFilter,
        paymentFilter
    ]);

    const loadSales = async () => {

        // console.log({
        //     search,
        //     category: categoryFilter,
        //     sales_channel: channelFilter,
        //     payment_method: paymentFilter
        // });

       const params: any = {
        search,
        sales_channel: channelFilter,
        payment_method: paymentFilter
    };

    if (categoryFilter !== "") {
        params.category = Number(categoryFilter);
    }

    // console.log(params);

    const res = await getSales(params);

    setSales(res.data);
};
    const loadProducts = async () => {

        const res = await getProducts();

        setProducts(res.data);

    };

    const loadCategories = async () => {

        const res = await getCategories();

        setCategories(res.data);

    };

    const loadSummary = async () => {

        const res = await dashboardSummary();

        setSummary(res.data);

    };

    const handleDelete = async (id: number) => {

        if (!window.confirm("Delete Sale?"))
            return;

        await deleteSale(id);

        loadSales();

        loadSummary();

    };

    const handleEdit = (sale: any) => {

        setSelectedSale(sale);

        setOpenEdit(true);

    };

    const handleView = (sale: any) => {

        setSelectedSale(sale);

        setOpenDetails(true);

    };

    return (

        <Box className="sales-page">

            <Box className="sales-header">

                <Typography variant="h4">
                    Sales Management
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAdd(true)}
                >
                    New Sale
                </Button>

            </Box>

            {/* Dashboard Cards */}

            <Grid container spacing={2} sx={{ mb: 3 }}>

                <Grid item xs={12} sm={6} md={3}>

                    <Card className="summary-card">

                        <CardContent>

                            <Typography variant="subtitle2">
                                Total Sales
                            </Typography>

                            <Typography variant="h4">
                                {summary.total_sales}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid item xs={12} sm={6} md={3}>

                    <Card className="summary-card">

                        <CardContent>

                            <Typography variant="subtitle2">
                                Revenue
                            </Typography>

                            <Typography variant="h4">
                                ₹{summary.total_revenue}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid item xs={12} sm={6} md={3}>

                    <Card className="summary-card">

                        <CardContent>

                            <Typography variant="subtitle2">
                                Orders
                            </Typography>

                            <Typography variant="h4">
                                {summary.total_orders}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid item xs={12} sm={6} md={3}>

                    <Card className="summary-card">

                        <CardContent>

                            <Typography variant="subtitle2">
                                Avg Order
                            </Typography>

                            <Typography variant="h4">
                                ₹{summary.average_order_value}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

            {/* Filters */}

            <Box className="sales-filters">

                <TextField
                    label="Search"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <TextField
                    select
                    label="Category"
                    value={categoryFilter}
                    onChange={(e) =>
                        setCategoryFilter(
                            e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                        )
                    }
                >

                    <MenuItem value="">
                        All
                    </MenuItem>

                    {categories.map((c) => (

                        <MenuItem
                            key={c.id}
                            value={Number(c.id)}
                        >
                            {c.name}
                        </MenuItem>

                    ))}

                </TextField>

                <TextField
                    select
                    label="Channel"
                    value={channelFilter}
                    onChange={(e) =>
                        setChannelFilter(e.target.value)
                    }
                >

                    <MenuItem value="">
                        All
                    </MenuItem>

                    <MenuItem value="Retail Store">
                        Retail Store
                    </MenuItem>

                    <MenuItem value="Online Store">
                        Online Store
                    </MenuItem>

                    <MenuItem value="Marketplace">
                        Marketplace
                    </MenuItem>

                </TextField>

                <TextField
                    select
                    label="Payment"
                    value={paymentFilter}
                    onChange={(e) =>
                        setPaymentFilter(e.target.value)
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

                </TextField>

                <Button
                    variant="contained"
                    onClick={loadSales}
                >
                    Search
                </Button>

            </Box>

            {/* Table */}

            <SalesTable
                sales={sales}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
            />

            {/* Dialogs */}

            <AddSaleDialog
                open={openAdd}
                onClose={() => {

                    setOpenAdd(false);

                    loadSales();

                    loadSummary();

                }}
                products={products}
            />

            <EditSaleDialog
                open={openEdit}
                onClose={() => {

                    setOpenEdit(false);

                    loadSales();

                    loadSummary();

                }}
                sale={selectedSale}
                products={products}
            />

            <SaleDetailsDialog
                open={openDetails}
                onClose={() =>
                    setOpenDetails(false)
                }
                sale={selectedSale}
            />

        </Box>

    );

}