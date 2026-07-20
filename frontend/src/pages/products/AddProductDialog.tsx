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

import { createProduct } from "../../api/productApi";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: any[];
}

export default function AddProductDialog({
    open,
    onClose,
    categories
}: Props) {

    const [form, setForm] = useState({

        name: "",

        sku: "",

        category_id: "",

        brand: "",

        description: "",

        unit_price: "",

        cost_price: "",

        stock_quantity: "",

        unit_of_measure: "",

        status: "Active"

    });

    const change = (e: any) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const save = async () => {

        try {

            await createProduct({
                ...form,
                category_id: Number(form.category_id),
                unit_price: Number(form.unit_price),
                cost_price: Number(form.cost_price),
                stock_quantity: Number(form.stock_quantity)
            });

            setForm({
                name: "",
                sku: "",
                category_id: "",
                brand: "",
                description: "",
                unit_price: "",
                cost_price: "",
                stock_quantity: "",
                unit_of_measure: "",
                status: "Active"
            });

            onClose();

        } catch (err: any) {

            console.log(err.response);

            alert(err.response?.data?.detail);

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

                Add Product

            </DialogTitle>

            <DialogContent>

                <TextField
                    fullWidth
                    margin="normal"
                    label="Product Name"
                    name="name"
                    value={form.name}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="SKU"
                    name="sku"
                    value={form.sku}
                    onChange={change}
                />

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Category"
                    name="category_id"
                    value={form.category_id}
                    onChange={change}
                >

                    {

                        categories.map((c) => (

                            <MenuItem
                                key={c.id}
                                value={c.id}
                            >

                                {c.name}

                            </MenuItem>

                        ))

                    }

                </TextField>

                <TextField
                    fullWidth
                    margin="normal"
                    label="Brand"
                    name="brand"
                    value={form.brand}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    type="number"
                    label="Unit Price"
                    name="unit_price"
                    value={form.unit_price}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    type="number"
                    label="Cost Price"
                    name="cost_price"
                    value={form.cost_price}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    type="number"
                    label="Stock Quantity"
                    name="stock_quantity"
                    value={form.stock_quantity}
                    onChange={change}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Unit Of Measure"
                    name="unit_of_measure"
                    value={form.unit_of_measure}
                    onChange={change}
                />

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={change}
                >

                    <MenuItem value="Active">
                        Active
                    </MenuItem>

                    <MenuItem value="Inactive">
                        Inactive
                    </MenuItem>

                    <MenuItem value="Out of Stock">
                        Out of Stock
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