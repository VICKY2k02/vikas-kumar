import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    MenuItem
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import InventoryTable from "../inventory/InventoryTable";

import AddInventoryDialog from "../inventory/AddInventoryDialog";
import AddStockDialog from "../inventory/AddStockDialog";
import RemoveStockDialog from "../inventory/RemoveStockDialog";
import AdjustStockDialog from "../inventory/AdjustStockDialog";
import ReorderLevelDialog from "../inventory/ReorderLevelDialog";
import InventoryMovementDialog from "../inventory/InventoryMovementDialog";
import InventoryCharts from "../inventory/InventoryCharts";

import {
    getInventory,
    getInventoryDashboard,
    getInventoryMovements
} from "../../api/inventoryApi";

import { getCategories } from "../../api/categoryApi";
import { getProducts } from "../../api/productApi";




import "../auth/styles/Inventory.css";

export default function Inventory() {

    const [inventory, setInventory] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);


    const [dashboard, setDashboard] = useState({

        total_products: 0,

        total_inventory: 0,

        low_stock: 0,

        out_of_stock: 0

    });

    const [search, setSearch] = useState("");

    const [category, setCategory] =
        useState("");

    const [brand, setBrand] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [selectedInventory,
        setSelectedInventory] =
        useState<any>(null);

    const [openAdd,
        setOpenAdd] =
        useState(false);

    const [openAddStock,
        setOpenAddStock] =
        useState(false);

    const [openRemoveStock,
        setOpenRemoveStock] =
        useState(false);

    const [openAdjust,
        setOpenAdjust] =
        useState(false);

    const [openReorder,
        setOpenReorder] =
        useState(false);

    const [openMovement, setOpenMovement] = useState(false);

    const [movements, setMovements] = useState<any[]>([]);

    useEffect(() => {

        loadInventory();

        loadDashboard();

        loadCategories();

        loadProducts();

    }, []);

    useEffect(() => {

        loadInventory();

    }, [

        search,

        category,

        brand,

        status

    ]);

    const loadInventory = async () => {

        const params: any = {};

if (search) params.search = search;
if (category) params.category = Number(category);
if (brand) params.brand = brand;
if (status) params.stock_status = status;

const res = await getInventory(params);

        setInventory(res.data);

    };




    const loadDashboard = async () => {

    const res = await getInventoryDashboard();

    setDashboard({
        total_products: res.data.summary.total_products,
        total_inventory: res.data.summary.total_inventory_quantity,
        low_stock: res.data.summary.low_stock_products,
        out_of_stock: res.data.summary.out_of_stock_products,
    });

};

    const loadCategories = async () => {

        const res =
            await getCategories();

        setCategories(res.data);

    };

    const loadProducts = async () => {

        const res =
            await getProducts();

        setProducts(res.data);

    };

    return (

        <Box className="inventory-page">

            <Box className="inventory-header">

                <Typography variant="h4">

                    Inventory Management

                </Typography>

                <Button

                    variant="contained"

                    startIcon={<AddIcon />}

                    onClick={() =>
                        setOpenAdd(true)
                    }

                >

                    Add Inventory

                </Button>

            </Box>

            {/* Dashboard */}

            <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
            >

                <Grid item xs={3}>

                    <Card>

                        <CardContent>

                            <Typography>

                                Total Products

                            </Typography>

                            <Typography variant="h4">

                                {
                                    dashboard.total_products
                                }

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid item xs={3}>

                    <Card>

                        <CardContent>

                            <Typography>

                                Total Inventory

                            </Typography>

                            <Typography variant="h4">

                                {
                                    dashboard.total_inventory
                                }

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid item xs={3}>

                    <Card>

                        <CardContent>

                            <Typography>

                                Low Stock

                            </Typography>

                            <Typography variant="h4">

                                {
                                    dashboard.low_stock
                                }

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                <Grid item xs={3}>

                    <Card>

                        <CardContent>

                            <Typography>

                                Out Of Stock

                            </Typography>

                            <Typography variant="h4">

                                {
                                    dashboard.out_of_stock
                                }

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

            {/* Filters */}

            <Box className="inventory-filters">

                <TextField

                    label="Search"

                    value={search}

                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }

                />

                <TextField

                    select

                    label="Category"

                    value={category}

                    onChange={(e) =>
                        setCategory(
                            e.target.value
                        )
                    }

                >

                    <MenuItem value="">

                        All

                    </MenuItem>

                    {

                        categories.map((c) => (

                            <MenuItem

                                key={c.id}

                                value={c.id}

                            >

                                {c.name}

                            </MenuItem>

                        ))

                    }

                </TextField>

                <TextField

                    label="Brand"

                    value={brand}

                    onChange={(e) =>
                        setBrand(
                            e.target.value
                        )
                    }

                />

                <TextField

                    select

                    label="Status"

                    value={status}

                    onChange={(e) =>
                        setStatus(
                            e.target.value
                        )
                    }

                >

                    <MenuItem value="">

                        All

                    </MenuItem>

                    <MenuItem value="In Stock">

                        In Stock

                    </MenuItem>

                    <MenuItem value="Low Stock">

                        Low Stock

                    </MenuItem>

                    <MenuItem value="Out of Stock">

                        Out of Stock

                    </MenuItem>

                </TextField>

            </Box>

            {/* Table */}

            <InventoryTable

                inventory={inventory}

                onAddStock={(row: any) => {

                    setSelectedInventory(row);

                    setOpenAddStock(true);

                }}

                onRemoveStock={(row: any) => {

                    setSelectedInventory(row);

                    setOpenRemoveStock(true);

                }}

                onAdjust={(row: any) => {

                    setSelectedInventory(row);

                    setOpenAdjust(true);

                }}

                onReorder={(row: any) => {

                    setSelectedInventory(row);

                    setOpenReorder(true);

                }}

                onMovement={async (row: any) => {

                    setSelectedInventory(row);

                    const res = await getInventoryMovements(row.id);

                    setMovements(res.data);

                    setOpenMovement(true);

                }}

            />

            {/* Charts */}

            <InventoryCharts
                inventory={inventory}
            />

            {/* Dialogs */}

            <AddInventoryDialog
                open={openAdd}
                onClose={() => {

                    setOpenAdd(false);

                    loadInventory();

                    loadDashboard();

                }}
                products={products}
            />

            <AddStockDialog
                open={openAddStock}
                inventory={selectedInventory}
                onClose={() => {

                    setOpenAddStock(false);

                    loadInventory();

                    loadDashboard();

                }}
            />

            <RemoveStockDialog
                open={openRemoveStock}
                inventory={selectedInventory}
                onClose={() => {

                    setOpenRemoveStock(false);

                    loadInventory();

                    loadDashboard();

                }}
            />

            <AdjustStockDialog
                open={openAdjust}
                inventory={selectedInventory}
                onClose={() => {

                    setOpenAdjust(false);

                    loadInventory();

                    loadDashboard();

                }}
            />

            <ReorderLevelDialog
                open={openReorder}
                inventory={selectedInventory}
                onClose={() => {

                    setOpenReorder(false);

                    loadInventory();

                    loadDashboard();

                }}
            />

            <InventoryMovementDialog
                open={openMovement}
                movements={movements}
                onClose={() => setOpenMovement(false)}
            />

        </Box>

    );

}