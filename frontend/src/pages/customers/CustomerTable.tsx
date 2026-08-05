import { useState } from "react";

import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress,
    Box
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";

interface Props {

    customers: any[];

    loading: boolean;

    // onView: (customer: any) => void;

    onEdit: (customer: any) => void;

    onDelete: (customer: any) => void;

    onStatusChange: (customer: any) => void;

}

export default function CustomerTable({

    customers,

    loading,

    // onView,

    onEdit,

    onDelete,

    onStatusChange

}: Props) {

    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] =
        useState<null | HTMLElement>(null);

    const [selectedCustomer,
        setSelectedCustomer] = useState<any>(null);

    const handleMenuOpen = (

        event: React.MouseEvent<HTMLElement>,

        customer: any

    ) => {

        setAnchorEl(event.currentTarget);

        setSelectedCustomer(customer);

    };

    const handleClose = () => {

        setAnchorEl(null);

        setSelectedCustomer(null);

    };

    // const handleMenuClose = () => {

    //     setAnchorEl(null);

    //     setSelectedCustomer(null);

    // };

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

                        <TableCell>Customer ID</TableCell>

                        <TableCell>Name</TableCell>

                        <TableCell>Email</TableCell>

                        <TableCell>Phone</TableCell>

                        <TableCell>Type</TableCell>

                        <TableCell>City</TableCell>

                        <TableCell>Status</TableCell>

                        <TableCell>Total Orders</TableCell>

                        <TableCell>Revenue</TableCell>

                        <TableCell>Last Purchase</TableCell>

                        <TableCell align="center">
                            Actions
                        </TableCell>

                    </TableRow>
                </TableHead>

                <TableBody>

                    {(customers?.length ?? 0) === 0 ? (

                        <TableRow>

                            <TableCell
                                colSpan={11}
                                align="center"
                            >
                                No Customers Found
                            </TableCell>

                        </TableRow>

                    ) : (

                        (customers ?? []).map((customer) => (

                            <TableRow key={customer.id}>

                                <TableCell>{customer.customer_id}</TableCell>

                                <TableCell>{customer.full_name}</TableCell>

                                <TableCell>{customer.email}</TableCell>

                                <TableCell>{customer.phone}</TableCell>

                                <TableCell>{customer.customer_type}</TableCell>

                                <TableCell>{customer.city}</TableCell>

                                <TableCell>

                                    <Chip
                                        label={customer.status}
                                        color={
                                            customer.status === "Active"
                                                ? "success"
                                                : "error"
                                        }
                                    />

                                </TableCell>

                                <TableCell>
                                    {/* {customer.purchase_summary?.total_orders ?? 0} */}
                                    { 2}

                                </TableCell>

                                <TableCell>
                                    {/* ₹{customer.purchase_summary?.total_revenue ?? 0} */}
                                    { 100000}

                                </TableCell>

                                <TableCell>
                                    {customer.purchase_summary?.last_purchase_date
                                        ? new Date(
                                            customer.purchase_summary.last_purchase_date
                                        ).toLocaleDateString()
                                        : "-"}
                                </TableCell>

                                <TableCell align="center">

                                    <IconButton
                                        onClick={(e) =>
                                            handleMenuOpen(e, customer)
                                        }
                                    >
                                        <MoreVertIcon />
                                    </IconButton>

                                </TableCell>

                            </TableRow>

                        ))

                    )}

                </TableBody>

            </Table>
            {/* 
            <Menu

                anchorEl={anchorEl}

                open={Boolean(anchorEl)}

                onClose={handleMenuClose}

            >

                <MenuItem

                    onClick={() => {

                        console.log(

                            "Profile",

                            selectedCustomer

                        );

                        handleMenuClose();

                    }}

                >

                    View Profile

                </MenuItem>

                <MenuItem

                    onClick={() => {

                        console.log(

                            "Edit",

                            selectedCustomer

                        );

                        handleMenuClose();

                    }}

                >

                    Edit

                </MenuItem>

                <MenuItem

                    onClick={() => {

                        console.log(

                            "Status",

                            selectedCustomer

                        );

                        handleMenuClose();

                    }}

                >

                    Activate / Deactivate

                </MenuItem>

                <MenuItem

                    onClick={() => {

                        console.log(

                            "Delete",

                            selectedCustomer

                        );

                        handleMenuClose();

                    }}

                >

                    Delete

                </MenuItem>

            </Menu> */}

            <Menu

                anchorEl={anchorEl}

                open={Boolean(anchorEl)}

                onClose={handleClose}

            >

                <MenuItem
    onClick={() => {

        navigate(`/customers/${selectedCustomer.id}`);

        handleClose();

    }}
>
    View Profile
</MenuItem>

                <MenuItem

                    onClick={() => {

                        onEdit(selectedCustomer);

                        handleClose();

                    }}

                >

                    Edit

                </MenuItem>

                <MenuItem

                    onClick={() => {

                        onStatusChange(selectedCustomer);

                        handleClose();

                    }}

                >

                    {

                        selectedCustomer?.status === "Active"

                            ? "Deactivate"

                            : "Activate"

                    }

                </MenuItem>

                <MenuItem

                    onClick={() => {

                        onDelete(selectedCustomer);

                        handleClose();

                    }}

                >

                    Delete

                </MenuItem>

            </Menu>

        </>

    );

}