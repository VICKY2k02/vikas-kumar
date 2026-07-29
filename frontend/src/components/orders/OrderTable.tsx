import { useState } from "react";

import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";

interface Props {

    orders: any[];

    loading: boolean;

    onView: (order: any) => void;

    onEdit: (order: any) => void;

    onDelete: (order: any) => void;

}

export default function OrderTable({

    orders,

    loading,

    onView,

    onEdit,

    onDelete

}: Props) {

    const [anchorEl, setAnchorEl] =
        useState<null | HTMLElement>(null);

    const [selectedOrder, setSelectedOrder] =
        useState<any>(null);

    const handleMenuOpen = (

        event: React.MouseEvent<HTMLElement>,

        order: any

    ) => {

        setAnchorEl(event.currentTarget);

        setSelectedOrder(order);

    };

    const handleClose = () => {

        setAnchorEl(null);

        setSelectedOrder(null);

    };

    if (loading) {

        return (

            <Box
                display="flex"
                justifyContent="center"
                mt={5}
            >

                <CircularProgress />

            </Box>

        );

    }

    return (

        <>

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>Order ID</TableCell>

                        <TableCell>Customer ID</TableCell>

                        <TableCell>Total Amount</TableCell>

                        <TableCell>Quantity</TableCell>

                        <TableCell>Payment</TableCell>

                        <TableCell>Status</TableCell>

                        <TableCell>Created Date</TableCell>

                        <TableCell align="center">
                            Actions
                        </TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {

                        orders.length === 0 ?

                            (

                                <TableRow>

                                    <TableCell

                                        align="center"

                                        colSpan={8}

                                    >

                                        No Orders Found

                                    </TableCell>

                                </TableRow>

                            )

                            :

                            (

                                orders.map(

                                    (order) => (

                                        <TableRow

                                            key={order.id}

                                        >

                                            <TableCell>

                                                #{order.id}

                                            </TableCell>

                                            <TableCell>

                                                {order.customer_name}

                                            </TableCell>

                                            <TableCell>

                                                ₹

                                                {

                                                    order.total_amount

                                                }

                                            </TableCell>

                                            <TableCell>

                                                {

                                                    order.total_quantity

                                                }

                                            </TableCell>

                                            <TableCell>

                                                {

                                                    order.payment_method

                                                }

                                            </TableCell>

                                            <TableCell>

                                                <Chip

                                                    label={

                                                        order.status

                                                    }

                                                    color={

                                                        order.status === "Completed"

                                                            ? "success"

                                                            : order.status === "Pending"

                                                                ? "warning"

                                                                : "error"

                                                    }

                                                />

                                            </TableCell>

                                            <TableCell>

                                                {

                                                    order.created_at

                                                        ?

                                                        new Date(

                                                            order.created_at

                                                        ).toLocaleDateString()

                                                        :

                                                        "-"

                                                }

                                            </TableCell>

                                            <TableCell

                                                align="center"

                                            >

                                                <IconButton

                                                    onClick={(e) =>

                                                        handleMenuOpen(

                                                            e,

                                                            order

                                                        )

                                                    }

                                                >

                                                    <MoreVertIcon />

                                                </IconButton>

                                            </TableCell>

                                        </TableRow>

                                    )

                                )

                            )

                    }

                </TableBody>

            </Table>

            <Menu

                anchorEl={anchorEl}

                open={Boolean(anchorEl)}

                onClose={handleClose}

            >

                <MenuItem

                    onClick={() => {

                        onView(

                            selectedOrder

                        );

                        handleClose();

                    }}

                >

                    View

                </MenuItem>

                <MenuItem

                    onClick={() => {

                        onEdit(

                            selectedOrder

                        );

                        handleClose();

                    }}

                >

                    Edit

                </MenuItem>

                <MenuItem

                    onClick={() => {

                        onDelete(

                            selectedOrder

                        );

                        handleClose();

                    }}

                >

                    Delete

                </MenuItem>

            </Menu>

        </>

    );

}