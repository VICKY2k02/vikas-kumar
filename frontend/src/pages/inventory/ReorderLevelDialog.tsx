import { useState, useEffect } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";

import { updateReorderLevel } from "../../api/inventoryApi";

interface Props {

    open: boolean;

    onClose: () => void;

    inventory: any;

}

export default function ReorderLevelDialog({

    open,

    onClose,

    inventory

}: Props) {

    const [reorderLevel, setReorderLevel] =
        useState(0);

    useEffect(() => {

        if (inventory) {

            setReorderLevel(
                inventory.reorder_level
            );

        }

    }, [inventory]);

const handleSave = async () => {
    try {

        await updateReorderLevel(
            inventory.id,
            Number(reorderLevel)
        );

        onClose();

    } catch (err: any) {

        console.log(err.response.data);

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

                Update Reorder Level

            </DialogTitle>

            <DialogContent>

                <TextField

                    fullWidth

                    margin="normal"

                    label="Reorder Level"

                    type="number"

                    value={reorderLevel}

                    onChange={(e) =>
                        setReorderLevel(
                            Number(e.target.value)
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

                    Update

                </Button>

            </DialogActions>

        </Dialog>

    );

}