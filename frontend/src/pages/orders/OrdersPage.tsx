import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";


import AddIcon from "@mui/icons-material/Add";

import OrderTable from "../../components/orders/OrderTable";
import CreateOrderDialog from "../../components/orders/CreateOrderDialog";

import {
    getOrders,
    deleteOrder,
    updateOrder
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



    const [selectedOrder, setSelectedOrder] =
        useState<any | null>(null);

    const [editData, setEditData] = useState({
        total_amount: "",
        total_quantity: "",
        payment_method: "",
        status: ""
    });

    const [viewOpen, setViewOpen] = useState(false);

    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {

        loadOrders();

    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredOrders(orders);
            return;
        }

        const value = search.toLowerCase();

        const filtered = orders.filter((order: any) =>
            String(order.id).includes(value) ||

            String(order.customer_id).includes(value) ||

            (order.customer_name ?? "")
                .toLowerCase()
                .includes(value) ||

            (order.payment_method ?? "")
                .toLowerCase()
                .includes(value) ||

            (order.status ?? "")
                .toLowerCase()
                .includes(value)
        );

        setFilteredOrders(filtered);

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


    const handleView = (order: any) => {

        console.log(order);

        setSelectedOrder(order);

        setViewOpen(true);

    };
    const handleEdit = (order: any) => {

        setSelectedOrder(order);

        setEditData({
            total_amount: order.total_amount,
            total_quantity: order.total_quantity,
            payment_method: order.payment_method,
            status: order.status
        });

        setEditOpen(true);

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


    const handleUpdate = async () => {

        try {

            await updateOrder(
                selectedOrder!.id,
                editData
            );

            setEditOpen(false);

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
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />


                {/* View Dialog */}
                <Dialog
                    open={viewOpen}
                    onClose={() => setViewOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Order Details
                    </DialogTitle>

                    <DialogContent>
                        {selectedOrder && (
                            <>
                                <Typography>Order ID : {selectedOrder.id}</Typography>

                                <Typography>
                                    Customer : {selectedOrder.customer_name}
                                </Typography>

                                <Typography>
                                    Amount : ₹{selectedOrder.total_amount}
                                </Typography>

                                <Typography>
                                    Quantity : {selectedOrder.total_quantity}
                                </Typography>

                                <Typography>
                                    Payment : {selectedOrder.payment_method}
                                </Typography>

                                <Typography>
                                    Status : {selectedOrder.status}
                                </Typography>
                            </>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setViewOpen(false)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Edit Order
                    </DialogTitle>

                    <DialogContent>

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Total Amount"
                            value={editData.total_amount}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    total_amount: e.target.value
                                })
                            }
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Quantity"
                            value={editData.total_quantity}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    total_quantity: e.target.value
                                })
                            }
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Payment Method"
                            value={editData.payment_method}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    payment_method: e.target.value
                                })
                            }
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Status"
                            value={editData.status}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    status: e.target.value
                                })
                            }
                        />

                    </DialogContent>

                    <DialogActions>

                        <Button
                            onClick={() => setEditOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleUpdate}
                        >
                            Update
                        </Button>

                    </DialogActions>

                </Dialog>

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