import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from "@mui/material";

interface Props {

    open: boolean;

    onClose: () => void;

    movements: any[];

}

export default function InventoryMovementDialog({

    open,

    onClose,

    movements

}: Props) {

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
        >

            <DialogTitle>

                Inventory Movement History

            </DialogTitle>

            <DialogContent>

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>

                                Movement Type

                            </TableCell>

                            <TableCell>

                                Previous Qty

                            </TableCell>

                            <TableCell>

                                Updated Qty

                            </TableCell>

                            <TableCell>

                                Changed

                            </TableCell>

                            <TableCell>

                                Reason

                            </TableCell>

                            <TableCell>

                                Remarks

                            </TableCell>

                            <TableCell>

                                User

                            </TableCell>

                            <TableCell>

                                Date

                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {movements.map((m) => (

                            <TableRow key={m.id}>

                                <TableCell>

                                    {m.movement_type}

                                </TableCell>

                                <TableCell>

                                    {m.previous_quantity}

                                </TableCell>

                                <TableCell>

                                    {m.updated_quantity}

                                </TableCell>

                                <TableCell>

                                    {m.quantity_changed}

                                </TableCell>

                                <TableCell>

                                    {m.reason}

                                </TableCell>

                                <TableCell>

                                    {m.remarks}

                                </TableCell>

                                <TableCell>

                                    {m.performed_by}

                                </TableCell>

                                <TableCell>

                                    {m.created_at}

                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </DialogContent>

        </Dialog>

    );

}