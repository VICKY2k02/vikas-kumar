import { useEffect, useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem
} from "@mui/material";

import { createOrder } from "../../api/orderApi";
import { getCustomers } from "../../api/customerApi";

interface Props {

    open: boolean;

    onClose: () => void;

    onSuccess: () => void;

}

export default function CreateOrderDialog({

    open,

    onClose,

    onSuccess

}: Props) {

    const [customers, setCustomers] =
        useState<any[]>([]);

    const [form, setForm] = useState({

        customer_id: "",

        total_amount: "",

        total_quantity: "",

        payment_method: "Cash",

        status: "Completed"

    });

    useEffect(() => {

        if (open) {

            loadCustomers();

        }

    }, [open]);

    const loadCustomers = async () => {

        try {

            const data = await getCustomers({

                search: "",

                customer_type: "",

                status: "",

                city: "",

                state: "",

                country: ""

            });

            setCustomers(data);

        }

        catch (err) {

            console.log(err);

        }

    };

    const handleChange = (

        e: any

    ) => {

        setForm({

            ...form,

            [e.target.name]:

                e.target.value

        });

    };

    const handleSubmit = async () => {

        try {

            await createOrder({

                customer_id:

                    Number(form.customer_id),

                total_amount:

                    Number(form.total_amount),

                total_quantity:

                    Number(form.total_quantity),

                payment_method:

                    form.payment_method,

                status:

                    form.status

            });

            onSuccess();

            onClose();

            setForm({

                customer_id: "",

                total_amount: "",

                total_quantity: "",

                payment_method: "Cash",

                status: "Completed"

            });

        }

        catch (err) {

            console.log(err);

        }

    };

    return (

        <Dialog

            open={open}

            onClose={onClose}

            maxWidth="sm"

            fullWidth

        >

            <DialogTitle>

                Create Order

            </DialogTitle>

            <DialogContent>

                <Grid
                    container
                    spacing={2}
                    mt={1}
                >

                    <Grid item xs={12}>

                        <TextField

                            select

                            fullWidth

                            label="Customer"

                            name="customer_id"

                            value={form.customer_id}

                            onChange={handleChange}

                        >

                            {

                                customers.map(

                                    (customer) => (

                                        <MenuItem

                                            key={customer.id}

                                            value={customer.id}

                                        >

                                            {

                                                customer.full_name

                                            }

                                        </MenuItem>

                                    )

                                )

                            }

                        </TextField>

                    </Grid>

                    <Grid item xs={12}>

                        <TextField

                            fullWidth

                            label="Total Amount"

                            name="total_amount"

                            type="number"

                            value={form.total_amount}

                            onChange={handleChange}

                        />

                    </Grid>

                    <Grid item xs={12}>

                        <TextField

                            fullWidth

                            label="Quantity"

                            type="number"

                            name="total_quantity"

                            value={form.total_quantity}

                            onChange={handleChange}

                        />

                    </Grid>

                    <Grid item xs={12}>

                        <TextField

                            select

                            fullWidth

                            label="Payment Method"

                            name="payment_method"

                            value={form.payment_method}

                            onChange={handleChange}

                        >

                            <MenuItem value="Cash">

                                Cash

                            </MenuItem>

                            <MenuItem value="Card">

                                Card

                            </MenuItem>

                            <MenuItem value="UPI">

                                UPI

                            </MenuItem>

                            <MenuItem value="Net Banking">

                                Net Banking

                            </MenuItem>

                        </TextField>

                    </Grid>

                    <Grid item xs={12}>

                        <TextField

                            select

                            fullWidth

                            label="Status"

                            name="status"

                            value={form.status}

                            onChange={handleChange}

                        >

                            <MenuItem value="Completed">

                                Completed

                            </MenuItem>

                            <MenuItem value="Pending">

                                Pending

                            </MenuItem>

                            <MenuItem value="Cancelled">

                                Cancelled

                            </MenuItem>

                        </TextField>

                    </Grid>

                </Grid>

            </DialogContent>

            <DialogActions>

                <Button

                    onClick={onClose}

                >

                    Cancel

                </Button>

                <Button

                    variant="contained"

                    onClick={handleSubmit}

                >

                    Save Order

                </Button>

            </DialogActions>

        </Dialog>

    );

}