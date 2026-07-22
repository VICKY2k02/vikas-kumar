import { useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem
} from "@mui/material";

import { createInventory } from "../../api/inventoryApi";

interface Props {

    open: boolean;

    onClose: () => void;

    products: any[];

}

export default function AddInventoryDialog({

    open,

    onClose,

    products

}: Props) {

    const [form, setForm] = useState({

        product_id: "",

        current_stock: 0,

        reserved_stock: 0,

        reorder_level: 5

    });

    const handleSave = async () => {

        await createInventory({

            ...form,

            product_id: Number(form.product_id),

            current_stock: Number(form.current_stock),

            reserved_stock: Number(form.reserved_stock),

            reorder_level: Number(form.reorder_level)

        });

        setForm({

            product_id: "",

            current_stock: 0,

            reserved_stock: 0,

            reorder_level: 5

        });

        onClose();

    };

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle>

                Create Inventory

            </DialogTitle>

            <DialogContent>

                <TextField

                    select

                    fullWidth

                    margin="normal"

                    label="Product"

                    value={form.product_id}

                    onChange={(e) =>
                        setForm({

                            ...form,

                            product_id: e.target.value

                        })
                    }

                >

                    {

                        products.map((p) => (

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

                    label="Current Stock"

                    type="number"

                    value={form.current_stock}

                    onChange={(e) =>
                        setForm({

                            ...form,

                            current_stock:
                                Number(e.target.value)

                        })
                    }

                />

                <TextField

                    fullWidth

                    margin="normal"

                    label="Reserved Stock"

                    type="number"

                    value={form.reserved_stock}

                    onChange={(e) =>
                        setForm({

                            ...form,

                            reserved_stock:
                                Number(e.target.value)

                        })
                    }

                />

                <TextField

                    fullWidth

                    margin="normal"

                    label="Reorder Level"

                    type="number"

                    value={form.reorder_level}

                    onChange={(e) =>
                        setForm({

                            ...form,

                            reorder_level:
                                Number(e.target.value)

                        })
                    }

                />

            </DialogContent>

            <DialogActions>

                <Button
                    onClick={onClose}
                >

                    Cancel

                </Button>

                <Button

                    variant="contained"

                    onClick={handleSave}

                >

                    Save

                </Button>

            </DialogActions>

        </Dialog>

    );

}