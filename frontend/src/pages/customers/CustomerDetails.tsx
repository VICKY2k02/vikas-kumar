import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    Box,
    Grid,
    Paper,
    Typography,
    Chip,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from "@mui/material";

import { getCustomer } from "../../api/customerApi";

export default function CustomerDetails() {

    const { id } = useParams();

    const [customer, setCustomer] = useState<any>();

    useEffect(() => {
        loadCustomer();
    }, []);

    const loadCustomer = async () => {
        const res = await getCustomer(Number(id));

        console.log("Customer API Response");
    console.log(res.data);

    
        setCustomer(res.data);
    };

    if (!customer) return <>Loading...</>;

    return (

        <Box p={3}>

            <Typography
                variant="h4"
                mb={3}
            >
                Customer Details
            </Typography>

            <Grid container spacing={3}>

                <Grid item xs={12} md={6}>

                    <Paper sx={{ p:3 }}>

                        <Typography variant="h6">
                            Customer Information
                        </Typography>

                        <Divider sx={{my:2}}/>

                        <Typography>
                            <b>Name :</b> {customer.full_name}
                        </Typography>

                        <Typography>
                            <b>Email :</b> {customer.email}
                        </Typography>

                        <Typography>
                            <b>Phone :</b> {customer.phone}
                        </Typography>

                    </Paper>

                </Grid>

                <Grid item xs={12} md={6}>

                    <Paper sx={{p:3}}>

                       <Typography variant="subtitle1" fontWeight="bold">
    Contact Details
</Typography>

<Typography>
    <strong>Address:</strong> {customer.address}
</Typography>

<Typography>
    <strong>City:</strong> {customer.city}
</Typography>

<Typography>
    <strong>State:</strong> {customer.state}
</Typography>

<Typography>
    <strong>Country:</strong> {customer.country}
</Typography>

<Typography>
    <strong>Postal Code:</strong> {customer.postal_code}
</Typography>

{/* <pre>{JSON.stringify(customer, null, 2)}</pre> */}

                    </Paper>

                </Grid>

                <Grid item xs={12} md={4}>

                    <Paper sx={{p:3}}>

                        <Typography variant="h6">
                            Customer Segment
                        </Typography>

                        <Divider sx={{my:2}}/>

                        <Chip
    label={customer.customer_type}
    color={
        customer.customer_type === "VIP"
            ? "error"
            : customer.customer_type === "Loyal"
            ? "success"
            : customer.customer_type === "Regular"
            ? "primary"
            : "default"
    }
/>

                    </Paper>

                </Grid>

                <Grid item xs={12} md={4}>

                    <Paper sx={{p:3}}>

                        <Typography variant="h6">
                            Total Orders
                        </Typography>

                        <Divider sx={{my:2}}/>

                        <Typography variant="h4">
                            {/* {customer.total_orders ?? 0} */}
                            {2}

                        </Typography>

                    </Paper>

                </Grid>

                <Grid item xs={12} md={4}>

                    <Paper sx={{p:3}}>

                        <Typography variant="h6">
                            Total Spend
                        </Typography>

                        

                        <Divider sx={{my:2}}/>

                        <Typography variant="h4">
                           {/* ₹ {customer.purchase_summary?.total_revenue ?? 0} */}
                           {/* ₹ {customer.total_revenue} */}
                           ₹ {100000}



                        </Typography>

                    </Paper>

                </Grid>

                <Grid item xs={12}>

                    <Paper sx={{p:3}}>

                        <Typography variant="h6">
                            Recent Purchase History
                        </Typography>

                        <Divider sx={{my:2}}/>

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>Invoice</TableCell>

                                    <TableCell>Date</TableCell>

                                    <TableCell>Amount</TableCell>

                                </TableRow>

                            </TableHead>

                            <TableBody>

                                <TableRow>

                                    <TableCell>INV-1001</TableCell>

                                    <TableCell>01 Aug 2026</TableCell>

                                    <TableCell>₹2400</TableCell>

                                </TableRow>

                                <TableRow>

                                    <TableCell>INV-1002</TableCell>

                                    <TableCell>25 Jul 2026</TableCell>

                                    <TableCell>₹1800</TableCell>

                                </TableRow>

                            </TableBody>

                        </Table>

                    </Paper>

                </Grid>

            </Grid>

        </Box>

    );

}