import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Divider
} from "@mui/material";

interface Transaction {
    id: number;
    sale_date: string;
    total_amount: number;
    quantity: number;
    payment_method: string;
}

interface Props {
    customer: any;
}

export default function CustomerPurchaseHistory({
    customer
}: Props) {

    const history = customer?.purchase_history || [];

    return (
        <Box mt={3}>

            <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
            >
                Purchase History
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>

                <Typography>
                    <b>Total Orders:</b>{" "}
                    {customer?.total_orders ?? 0}
                </Typography>

                <Typography>
                    <b>Total Revenue:</b> ₹
                    {customer?.total_revenue ?? 0}
                </Typography>

                <Typography>
                    <b>Total Quantity:</b>{" "}
                    {customer?.total_quantity ?? 0}
                </Typography>

                <Typography>
                    <b>Average Order Value:</b> ₹
                    {customer?.average_order_value ?? 0}
                </Typography>

                <Typography>
                    <b>First Purchase:</b>{" "}
                    {customer?.first_purchase_date || "-"}
                </Typography>

                <Typography>
                    <b>Last Purchase:</b>{" "}
                    {customer?.last_purchase_date || "-"}
                </Typography>

                <Typography>
                    <b>Favorite Product:</b>{" "}
                    {customer?.favorite_product || "-"}
                </Typography>

                <Typography>
                    <b>Favorite Category:</b>{" "}
                    {customer?.favorite_category || "-"}
                </Typography>

            </Paper>

            <Divider sx={{ mb: 2 }} />

            <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
            >
                Recent Transactions
            </Typography>

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>ID</TableCell>

                        <TableCell>Date</TableCell>

                        <TableCell>Quantity</TableCell>

                        <TableCell>Amount</TableCell>

                        <TableCell>Payment</TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {history.length === 0 ? (

                        <TableRow>

                            <TableCell
                                colSpan={5}
                                align="center"
                            >
                                No Transactions Found
                            </TableCell>

                        </TableRow>

                    ) : (

                        history.map(
                            (sale: Transaction) => (

                                <TableRow key={sale.id}>

                                    <TableCell>
                                        {sale.id}
                                    </TableCell>

                                    <TableCell>
                                        {sale.sale_date}
                                    </TableCell>

                                    <TableCell>
                                        {sale.quantity}
                                    </TableCell>

                                    <TableCell>
                                        ₹{sale.total_amount}
                                    </TableCell>

                                    <TableCell>
                                        {sale.payment_method}
                                    </TableCell>

                                </TableRow>

                            )
                        )

                    )}

                </TableBody>

            </Table>

        </Box>
    );
}