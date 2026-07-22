import { useState, useEffect } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem
} from "@mui/material";

import { adjustStock } from "../../api/inventoryApi";

interface Props {

    open: boolean;

    onClose: () => void;

    inventory: any;

}

export default function AdjustStockDialog({

    open,

    onClose,

    inventory

}: Props) {

    const [adjustmentType, setAdjustmentType] =
        useState("Manual Adjustment");

    const [quantity, setQuantity] =
        useState(0);

    const [reason, setReason] =
        useState("");

    const [remarks, setRemarks] =
        useState("");

    useEffect(() => {

        if (open) {

            setAdjustmentType(
                "Manual Adjustment"
            );

            setQuantity(0);

            setReason("");

            setRemarks("");

        }

    }, [open]);

    const handleSave = async () => {

        try {

            await adjustStock(inventory.id, {
                adjustment_type: adjustmentType,
                quantity: Number(quantity),
                reason,
                remarks
            });

            onClose();

        } catch (err: any) {

            console.log(err.response.data);

            alert(err.response.data.detail);

        }

    };

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle>

                Adjust Stock

            </DialogTitle>

            <DialogContent>

                <TextField

                    select

                    fullWidth

                    margin="normal"

                    label="Adjustment Type"

                    value={adjustmentType}

                    onChange={(e) =>
                        setAdjustmentType(
                            e.target.value
                        )
                    }

                >

                    <MenuItem value="Manual Adjustment">
                        Manual Adjustment
                    </MenuItem>

                    <MenuItem value="Stock Addition">
                        Stock Addition
                    </MenuItem>

                    <MenuItem value="Stock Removal">
                        Stock Removal
                    </MenuItem>

                </TextField>

                <TextField

                    fullWidth

                    margin="normal"

                    label="Quantity"

                    type="number"

                    value={quantity}

                    onChange={(e) =>
                        setQuantity(
                            Number(e.target.value)
                        )
                    }

                />

                <TextField

                    fullWidth

                    margin="normal"

                    label="Reason"

                    value={reason}

                    onChange={(e) =>
                        setReason(
                            e.target.value
                        )
                    }

                />

                <TextField

                    fullWidth

                    margin="normal"

                    multiline

                    rows={3}

                    label="Remarks"

                    value={remarks}

                    onChange={(e) =>
                        setRemarks(
                            e.target.value
                        )
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