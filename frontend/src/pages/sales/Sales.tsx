import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    Alert
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

import { getCustomers } from "../../api/customerApi";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";

import "../auth/styles/Sales.css";

export default function Sales() {

    const [sales, setSales] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    const [summary, setSummary] = useState({
        total_sales: 0,
        total_revenue: 0,
        total_orders: 0,
        average_order_value: 0
    });

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<number | "">("");
    const [channelFilter, setChannelFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [sortOrder, setSortOrder] = useState("desc");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);

    useEffect(() => {

        loadProducts();
        loadCategories();
        loadCustomers();
        loadSummary();

    }, []);

    useEffect(() => {

        loadSales();

    }, [
        search,
        categoryFilter,
        channelFilter,
        paymentFilter,
        statusFilter,
        fromDate,
        toDate,
        sortBy,
        sortOrder
    ]);

    const loadSales = async () => {

        setLoading(true);
        setError("");

        try {

            const params: any = {
                search,
                sales_channel: channelFilter,
                payment_method: paymentFilter,
                payment_status: statusFilter,
                sort_by: sortBy,
                sort_order: sortOrder
            };

            if (categoryFilter !== "") {
                params.category = Number(categoryFilter);
            }

            if (fromDate) {
                params.from_date = fromDate;
            }

            if (toDate) {
                params.to_date = toDate;
            }

            const res = await getSales(params);
            setSales(res.data);

        } catch (err) {

            console.error(err);
            setError("Failed to load sales. Please try again.");

        } finally {

            setLoading(false);

        }

    };

    const loadProducts = async () => {

        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }

    };

    const loadCustomers = async () => {

        try {
 
            const data = await getCustomers({
                search: "",
                customer_type: "",
                status: "",
                city: "",
                state: "",
                country: ""
            });
            setCustomers(data);
        } catch (err) {
            console.error(err);
        }

    };

    const loadCategories = async () => {

        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }

    };

    const loadSummary = async () => {

        try {
            const res = await dashboardSummary();
            setSummary(res.data);
        } catch (err) {
            console.error(err);
        }

    };

    const handleDelete = async (id: number) => {

        if (!window.confirm("Delete this sale?"))
            return;

        try {
            await deleteSale(id);
            loadSales();
            loadSummary();
        } catch (err) {
            console.error(err);
            alert("Failed to delete sale");
        }

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

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

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
            <Box className="sales-filters" sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>

                <TextField
                    label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <TextField
                    select
                    label="Category"
                    value={categoryFilter}
                    sx={{ minWidth: 140 }}
                    onChange={(e) =>
                        setCategoryFilter(
                            e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                        )
                    }
                >
                    <MenuItem value="">All</MenuItem>
                    {categories.map((c) => (
                        <MenuItem key={c.id} value={Number(c.id)}>
                            {c.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Channel"
                    value={channelFilter}
                    sx={{ minWidth: 140 }}
                    onChange={(e) => setChannelFilter(e.target.value)}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Retail Store">Retail Store</MenuItem>
                    <MenuItem value="Online Store">Online Store</MenuItem>
                    <MenuItem value="Marketplace">Marketplace</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Payment"
                    value={paymentFilter}
                    sx={{ minWidth: 140 }}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Payment Status"
                    value={statusFilter}
                    sx={{ minWidth: 140 }}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Refunded">Refunded</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>

                <TextField
                    label="From Date"
                    type="date"
                    value={fromDate}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setFromDate(e.target.value)}
                />

                <TextField
                    label="To Date"
                    type="date"
                    value={toDate}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setToDate(e.target.value)}
                />

                <TextField
                    select
                    label="Sort By"
                    value={sortBy}
                    sx={{ minWidth: 140 }}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="total_amount">Total Amount</MenuItem>
                    <MenuItem value="customer_name">Customer Name</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Order"
                    value={sortOrder}
                    sx={{ minWidth: 120 }}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <MenuItem value="desc">Newest / Highest</MenuItem>
                    <MenuItem value="asc">Oldest / Lowest</MenuItem>
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
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
                customers={customers}
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
                customers={customers}
            />

            <SaleDetailsDialog
                open={openDetails}
                onClose={() => setOpenDetails(false)}
                sale={selectedSale}
            />

        </Box>

    );

}
