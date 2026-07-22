import { useState, useEffect } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";

import { removeStock } from "../../api/inventoryApi";

interface Props {

    open: boolean;

    onClose: () => void;

    inventory: any;

}

export default function RemoveStockDialog({

    open,

    onClose,

    inventory

}: Props) {

    const [quantity, setQuantity] = useState(0);

    const [reason, setReason] = useState("");

    const [remarks, setRemarks] = useState("");

    useEffect(() => {

        if (open) {

            setQuantity(0);

            setReason("");

            setRemarks("");

        }

    }, [open]);

    const handleSave = async () => {

        await removeStock(

            inventory.id,

            {

                quantity,

                reason,

                remarks

            }

        );

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

                Remove Stock

            </DialogTitle>

            <DialogContent>

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

                    color="warning"

                    onClick={handleSave}

                >

                    Remove Stock

                </Button>

            </DialogActions>

        </Dialog>

    );

}