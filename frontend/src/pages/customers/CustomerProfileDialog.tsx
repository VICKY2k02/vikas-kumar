import {
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    Typography,
    Divider,
    Chip,
    Box
} from "@mui/material";

import CustomerPurchaseHistory from "./CustomerPurchaseHistory";
import CustomerTimeline from "./CustomerTimeline";


interface Props {
    open: boolean;
    customer: any;
    onClose: () => void;
}

export default function CustomerProfileDialog({
    open,
    customer,
    onClose
}: Props) {

    if (!customer) return null;

    return (

        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >

            <DialogTitle>

                Customer Profile

            </DialogTitle>

            <DialogContent>

                {/* Personal Information */}

                <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                >
                    Personal Information
                </Typography>

                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Name :</b>

                            {" "}

                            {customer.full_name}

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Email :</b>

                            {" "}

                            {customer.email}

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Phone :</b>

                            {" "}

                            {customer.phone}

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Gender :</b>

                            {" "}

                            {customer.gender}

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Date Of Birth :</b>

                            {" "}

                            {customer.date_of_birth}

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Customer Type :</b>

                            {" "}

                            {customer.customer_type}

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Preferred Channel :</b>

                            {" "}

                            {customer.preferred_sales_channel}

                        </Typography>

                    </Grid>

                    <Grid item xs={12} md={6}>

                        <Typography>

                            <b>Status :</b>

                            {" "}

                            <Chip
                                label={customer.status}
                                color={
                                    customer.status === "Active"
                                        ? "success"
                                        : "error"
                                }
                            />

                        </Typography>

                    </Grid>

                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Address */}

                <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                >
                    Address
                </Typography>

                <Typography>

                    {customer.address}

                </Typography>

                <Typography>

                    {customer.city},

                    {" "}

                    {customer.state},

                    {" "}

                    {customer.country}

                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Business Summary */}

                <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={2}
                >
                    Business Information
                </Typography>

                <Grid container spacing={2}>

                    <Grid item xs={6} md={3}>

                        <Box>

                            <Typography variant="subtitle2">

                                Lifetime Revenue

                            </Typography>

                            <Typography variant="h6">

                                ₹{customer.total_revenue ?? 0}

                            </Typography>

                        </Box>

                    </Grid>

                    <Grid item xs={6} md={3}>

                        <Box>

                            <Typography variant="subtitle2">

                                Orders

                            </Typography>

                            <Typography variant="h6">

                                {customer.total_orders ?? 0}

                            </Typography>

                        </Box>

                    </Grid>

                    <Grid item xs={6} md={3}>

                        <Box>

                            <Typography variant="subtitle2">

                                Avg Order

                            </Typography>

                            <Typography variant="h6">

                                ₹{customer.average_order_value ?? 0}

                            </Typography>

                        </Box>

                    </Grid>

                    <Grid item xs={6} md={3}>

                        <Box>

                            <Typography variant="subtitle2">

                                Purchase Frequency

                            </Typography>

                            <Typography variant="h6">

                                {customer.purchase_frequency ?? 0}

                            </Typography>

                        </Box>

                    </Grid>

                </Grid>

                <Divider sx={{ my: 3 }} />

                <CustomerPurchaseHistory

                    customer={customer}

                />

                <CustomerTimeline

    timeline={customer.timeline || []}

/>

            </DialogContent>

        </Dialog>

    );

}