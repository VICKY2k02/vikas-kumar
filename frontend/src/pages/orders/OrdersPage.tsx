import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Paper,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import OrderTable from "../../components/orders/OrderTable";
import CreateOrderDialog from "../../components/orders/CreateOrderDialog";

import {
    getOrders,
    deleteOrder
} from "../../api/orderApi";

export default function OrdersPage() {

    const [orders, setOrders] = useState<any[]>([]);

    const [filteredOrders, setFilteredOrders] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [openDialog, setOpenDialog] =
        useState(false);

    const [search, setSearch] =
        useState("");

    useEffect(() => {

        loadOrders();

    }, []);

    useEffect(() => {

        if (!search) {

            setFilteredOrders(orders);

            return;

        }

        const value = search.toLowerCase();

        setFilteredOrders(

            orders.filter(

                (order) =>

                    String(order.id)
                        .includes(value)

                    ||

                    String(order.customer_id)
                        .includes(value)

                    ||

                    order.payment_method
                        ?.toLowerCase()
                        .includes(value)

                    ||

                    order.status
                        ?.toLowerCase()
                        .includes(value)

            )

        );

    }, [search, orders]);

    const loadOrders = async () => {

        try {

            setLoading(true);

            const data = await getOrders();

            setOrders(data);

            setFilteredOrders(data);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    const handleDelete = async (

        order: any

    ) => {

        if (

            !window.confirm(

                "Delete this order?"

            )

        )

            return;

        try {

            await deleteOrder(order.id);

            loadOrders();

        }

        catch (err) {

            console.log(err);

        }

    };

    return (

        <Box p={3}>

            <Paper
                sx={{
                    p: 3
                }}
            >

                <Box

                    display="flex"

                    justifyContent="space-between"

                    alignItems="center"

                    mb={3}

                >

                    <Typography

                        variant="h5"

                        fontWeight="bold"

                    >

                        Order Management

                    </Typography>

                    <Button

                        variant="contained"

                        startIcon={<AddIcon />}

                        onClick={() =>

                            setOpenDialog(true)

                        }

                    >

                        Create Order

                    </Button>

                </Box>

                <TextField

                    fullWidth

                    label="Search Orders"

                    value={search}

                    onChange={(e) =>

                        setSearch(

                            e.target.value

                        )

                    }

                    sx={{

                        mb: 3

                    }}

                />

                <OrderTable

                    orders={filteredOrders}

                    loading={loading}

                    onView={(order) =>

                        console.log(

                            order

                        )

                    }

                    onEdit={(order) =>

                        console.log(

                            order

                        )

                    }

                    onDelete={handleDelete}

                />

            </Paper>

            <CreateOrderDialog

                open={openDialog}

                onClose={() =>

                    setOpenDialog(false)

                }

                onSuccess={loadOrders}

            />

        </Box>

    );

}