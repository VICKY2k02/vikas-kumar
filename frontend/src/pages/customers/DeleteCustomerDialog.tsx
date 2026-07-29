import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from "@mui/material";

import { deleteCustomer } from "../../api/customerApi";

interface Props {

    open: boolean;

    customer: any;

    onClose: () => void;

}

export default function DeleteCustomerDialog({

    open,

    customer,

    onClose

}: Props) {

    const handleDelete = async () => {

        if (!customer) return;

        await deleteCustomer(customer.id);

        onClose();

    };

    return (

        <Dialog

            open={open}

            onClose={onClose}

        >

            <DialogTitle>

                Delete Customer

            </DialogTitle>

            <DialogContent>

                <DialogContentText>

                    Are you sure you want to delete

                    <strong>

                        {" "}

                        {customer?.full_name}

                    </strong>

                    ?

                    <br />

                    This action cannot be undone.

                </DialogContentText>

            </DialogContent>

            <DialogActions>

                <Button

                    onClick={onClose}

                >

                    Cancel

                </Button>

                <Button

                    color="error"

                    variant="contained"

                    onClick={handleDelete}

                >

                    Delete

                </Button>

            </DialogActions>

        </Dialog>

    );

}