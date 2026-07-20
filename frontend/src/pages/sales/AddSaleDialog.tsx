import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem
} from "@mui/material";

import { useState } from "react";

import { createSale } from "../../api/salesApi";

interface Props {

    open: boolean;

    onClose: () => void;

    products: any[];

}

export default function AddSaleDialog({

    open,

    onClose,

    products

}: Props) {

    const [form, setForm] = useState({

        customer_name: "",

        product_id: "",

        quantity: 1,

        unit_price: 0,

        discount: 0,

        tax: 0,

        sales_channel: "Retail Store",

        payment_method: "Cash"

    });

    const change = (e: any) => {

        const { name, value } = e.target;

        if (name === "product_id") {

            const product = products.find(
                (p) => p.id === Number(value)
            );

            setForm({

                ...form,

                product_id: value,

                unit_price: product?.unit_price || 0

            });

            return;

        }

        setForm({

            ...form,

            [name]: value

        });

    };

    const save = async () => {

        try {

            await createSale({

                ...form,

                product_id: Number(form.product_id),

                quantity: Number(form.quantity),

                unit_price: Number(form.unit_price),

                discount: Number(form.discount),

                tax: Number(form.tax)

            });

            alert("Sale Created Successfully");

            onClose();

        }

        catch (err: any) {

            alert(

                err.response?.data?.detail ||

                "Unable to Create Sale"

            );

        }

    };

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >

            <DialogTitle>

                Create Sale

            </DialogTitle>

            <DialogContent>

                <TextField
                    fullWidth
                    margin="normal"
                    label="Customer Name"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={change}
                />

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Product"
                    name="product_id"
                    value={form.product_id}
                    onChange={change}
                >

                    {

                        products
                            .filter(
                                (p) => p.status !== "Out of Stock"
                            )
                            .map((p) => (

                                <MenuItem
                                    key={p.id}
                                    value={p.id}
                                >

                                    {p.name}

                                </MenuItem>

                            ))

                    }

                </TextField>

                <TextField
                    fullWidth
                    margin="normal"
                    label="Unit Price"
                    name="unit_price"
                    value={form.unit_price}
                    disabled
                />

                <TextField
                    fullWidth
                    margin="normal"
                    type="number"
                    label="Quantity"
                    name="quantity"
                    value={form.quantity}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    type="number"
                    label="Discount"
                    name="discount"
                    value={form.discount}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    type="number"
                    label="Tax"
                    name="tax"
                    value={form.tax}
                    onChange={change}
                />

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Sales Channel"
                    name="sales_channel"
                    value={form.sales_channel}
                    onChange={change}
                >

                    <MenuItem value="Retail Store">
                        Retail Store
                    </MenuItem>

                    <MenuItem value="Online Store">
                        Online Store
                    </MenuItem>

                    <MenuItem value="Marketplace">
                        Marketplace
                    </MenuItem>

                </TextField>

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Payment Method"
                    name="payment_method"
                    value={form.payment_method}
                    onChange={change}
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

                    <MenuItem value="Bank Transfer">
                        Bank Transfer
                    </MenuItem>

                </TextField>

            </DialogContent>

            <DialogActions>

                <Button
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={save}
                >
                    Save
                </Button>

            </DialogActions>

        </Dialog>

    );

}