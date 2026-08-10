import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Skeleton
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {

    sales: any[];

    loading?: boolean;

    onView: (sale: any) => void;

    onEdit: (sale: any) => void;

    onDelete: (id: number) => void;

}

function statusColor(status: string) {

    switch (status) {
        case "Paid":
            return "success";
        case "Pending":
            return "warning";
        case "Refunded":
        case "Cancelled":
            return "error";
        default:
            return "default";
    }
}

export default function SalesTable({

    sales,

    loading,

    onView,

    onEdit,

    onDelete

}: Props) {

    return (

        <TableContainer
            component={Paper}
            sx={{ mt: 3 }}
        >

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>Invoice</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Channel</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Actions</TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {loading ? (

                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 9 }).map((__, j) => (
                                    <TableCell key={j}>
                                        <Skeleton variant="text" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))

                    ) : (sales?.length ?? 0) === 0 ? (

                        <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                No Sales Found
                            </TableCell>
                        </TableRow>

                    ) : (

                        sales.map((sale) => (

                            <TableRow
                                key={sale.id}
                            >

                                <TableCell>
                                    {sale.invoice_number}
                                </TableCell>

                                <TableCell>
                                    {sale.customer_name}
                                </TableCell>

                                <TableCell>
                                    {sale.item_count ?? sale.items?.length ?? 0}
                                </TableCell>

                                <TableCell>
                                    ₹{sale.total_amount}
                                </TableCell>

                                <TableCell>
                                    {sale.sales_channel}
                                </TableCell>

                                <TableCell>
                                    {sale.payment_method}
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={sale.status || "-"}
                                        color={statusColor(sale.status) as any}
                                    />
                                </TableCell>

                                <TableCell>

                                    {sale.sale_date
                                        ? new Date(
                                            sale.sale_date
                                        ).toLocaleDateString()
                                        : "-"}

                                </TableCell>

                                <TableCell align="center">

                                    <IconButton
                                        color="primary"
                                        onClick={() =>
                                            onView(sale)
                                        }
                                    >

                                        <VisibilityIcon />

                                    </IconButton>

                                    <IconButton
                                        color="success"
                                        onClick={() =>
                                            onEdit(sale)
                                        }
                                    >

                                        <EditIcon />

                                    </IconButton>

                                    <IconButton
                                        color="error"
                                        onClick={() =>
                                            onDelete(sale.id)
                                        }
                                    >

                                        <DeleteIcon />

                                    </IconButton>

                                </TableCell>

                            </TableRow>

                        ))

                    )}

                </TableBody>

            </Table>

        </TableContainer>

    );

}
