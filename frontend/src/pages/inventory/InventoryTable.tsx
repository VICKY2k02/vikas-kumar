import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    IconButton,
    Menu,
    MenuItem
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";


import { useState } from "react";

interface Props {

    inventory: any[];

    onAddStock: (row: any) => void;

    onRemoveStock: (row: any) => void;

    onAdjust: (row: any) => void;

    onReorder: (row: any) => void;

    onMovement: (row: any) => void;

}


export default function InventoryTable({

    inventory,

    onAddStock,

    onRemoveStock,

    onAdjust,

    onReorder,

    onMovement

}: Props) {


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        row: any
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };


    return (

        <Table>

            <TableHead>

                <TableRow>

                    <TableCell>

                        Product

                    </TableCell>

                    <TableCell>

                        SKU

                    </TableCell>

                    <TableCell>

                        Category

                    </TableCell>

                    <TableCell>

                        Brand

                    </TableCell>

                    <TableCell>

                        Current Stock

                    </TableCell>

                    <TableCell>

                        Reserved Stock

                    </TableCell>

                    <TableCell>

                        Available Stock

                    </TableCell>

                    <TableCell>

                        Reorder Level

                    </TableCell>

                    <TableCell>

                        Status

                    </TableCell>

                    <TableCell>

                        Actions

                    </TableCell>

                </TableRow>

            </TableHead>

            <TableBody>

                {

                    inventory.map((row) => (

                        <TableRow
                            key={row.id}
                        >

                            <TableCell>

                                {row.product_name}

                            </TableCell>

                            <TableCell>

                                {row.sku}

                            </TableCell>

                            <TableCell>

                                {row.category}

                            </TableCell>

                            <TableCell>

                                {row.brand}

                            </TableCell>

                            <TableCell>

                                {row.current_stock}

                            </TableCell>

                            <TableCell>

                                {row.reserved_stock}

                            </TableCell>

                            <TableCell>

                                {row.available_stock}

                            </TableCell>

                            <TableCell>

                                {row.reorder_level}

                            </TableCell>

                            <TableCell>

                                <Chip

                                    label={
                                        row.stock_status
                                    }

                                    color={

                                        row.stock_status ===
                                            "In Stock"

                                            ? "success"

                                            : row.stock_status ===
                                                "Low Stock"

                                                ? "warning"

                                                : "error"

                                    }

                                />

                            </TableCell>

                            <TableCell>

                                <IconButton
                                    onClick={(e) => handleMenuOpen(e, row)}
                                >
                                    <MoreVertIcon />
                                </IconButton>

                            </TableCell>

                        </TableRow>

                    ))

                }

            </TableBody>


            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >

                <MenuItem
                    onClick={() => {
                        onAddStock(selectedRow);
                        handleMenuClose();
                    }}
                >
                    Add Stock
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onRemoveStock(selectedRow);
                        handleMenuClose();
                    }}
                >
                    Remove Stock
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onAdjust(selectedRow);
                        handleMenuClose();
                    }}
                >
                    Adjust Stock
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onReorder(selectedRow);
                        handleMenuClose();
                    }}
                >
                    Update Reorder Level
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onMovement(selectedRow);
                        handleMenuClose();
                    }}
                >
                    View History
                </MenuItem>

            </Menu>

        </Table>

    );

}