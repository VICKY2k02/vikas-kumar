import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {

    sales: any[];

    onView: (sale: any) => void;

    onEdit: (sale: any) => void;

    onDelete: (id: number) => void;

}

export default function SalesTable({

    sales,

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

                        <TableCell>
                            Invoice
                        </TableCell>

                        <TableCell>
                            Customer
                        </TableCell>

                        <TableCell>
                            Product
                        </TableCell>

                        <TableCell>
                            Qty
                        </TableCell>

                        <TableCell>
                            Total
                        </TableCell>

                        <TableCell>
                            Channel
                        </TableCell>

                        <TableCell>
                            Payment
                        </TableCell>

                        <TableCell>
                            Date
                        </TableCell>

                        <TableCell align="center">
                            Actions
                        </TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {

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

                                    {sale.product_name}

                                </TableCell>

                                <TableCell>

                                    {sale.quantity}

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

                                    {new Date(
                                        sale.sale_date
                                    ).toLocaleDateString()}

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

                    }

                </TableBody>

            </Table>

        </TableContainer>

    );

}