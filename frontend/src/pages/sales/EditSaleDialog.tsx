import { useEffect, useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Divider,
    Box,
    Alert
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { updateSale } from "../../api/salesApi";

interface Props {
    open: boolean;
    onClose: () => void;
    sale: any;
    products: any[];
    customers: any[];
}

interface CartLine {
    product_id: number;
    product_name: string;
    sku: string;
    category: string;
    available_stock: number;
    quantity: number;
    unit_price: number;
    discount: number;
    tax: number;
}

const emptyLine = {
    product_id: "",
    quantity: 1,
    unit_price: 0,
    sku: "",
    category: "",
    available_stock: 0,
    discount: 0,
    tax: 0
};

export default function EditSaleDialog({
    open,
    onClose,
    sale,
    products,
    customers
}: Props) {

    const [customerId, setCustomerId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [salesChannel, setSalesChannel] = useState("Retail Store");
    const [status, setStatus] = useState("Paid");
    const [notes, setNotes] = useState("");

    const [line, setLine] = useState<any>(emptyLine);
    const [lineError, setLineError] = useState("");

    const [cart, setCart] = useState<CartLine[]>([]);

    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

 
    useEffect(() => {

        if (!sale) return;

        setCustomerId(sale.customer_id || "");
        setPaymentMethod(sale.payment_method || "Cash");
        setSalesChannel(sale.sales_channel || "Retail Store");
        setStatus(sale.status || "Paid");
        setNotes(sale.notes || "");

        const existingItems: CartLine[] = (sale.items || []).map(
            (item: any) => ({
                product_id: item.product_id,
                product_name: item.product_name || "",
                sku: item.sku || "",
                category: item.category_name || "",
                available_stock: 0,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount || 0,
                tax: item.tax || 0
            })
        );

        setCart(existingItems);
        setFormError("");

    }, [sale]);

    const handleLineChange = (e: any) => {

        const { name, value } = e.target;

        if (name === "product_id") {

            const product = (products || []).find(
                (p: any) => p.id === Number(value)
            );

            setLine({
                ...line,
                product_id: value,
                unit_price: Number(product?.unit_price || 0),
                sku: product?.sku || "",
                category: product?.category_name || product?.category || "",
                available_stock: Number(product?.stock_quantity || 0),
                quantity: 1
            });

            setLineError("");
            return;
        }

        setLine({ ...line, [name]: value });
        setLineError("");
    };

    const validateQuantity = (qty: number, stock: number) => {

        if (!qty || qty <= 0) {
            return "Quantity must be greater than zero";
        }

 
        if (stock && qty > stock) {
            return `Only ${stock} in stock`;
        }

        return "";
    };

    const addLineToCart = () => {

        if (!line.product_id) {
            setLineError("Select a product first");
            return;
        }

        const qty = Number(line.quantity);

        const qtyError = validateQuantity(qty, line.available_stock);

        if (qtyError) {
            setLineError(qtyError);
            return;
        }

        if (Number(line.discount) < 0 || Number(line.tax) < 0) {
            setLineError("Discount / Tax cannot be negative");
            return;
        }

        const subtotal = qty * Number(line.unit_price);

        if (Number(line.discount) > subtotal) {
            setLineError("Discount exceeds line amount");
            return;
        }

        const product = (products || []).find(
            (p: any) => p.id === Number(line.product_id)
        );

        setCart([
            ...cart,
            {
                product_id: Number(line.product_id),
                product_name: product?.name || "",
                sku: line.sku,
                category: line.category,
                available_stock: line.available_stock,
                quantity: qty,
                unit_price: Number(line.unit_price),
                discount: Number(line.discount),
                tax: Number(line.tax)
            }
        ]);

        setLine(emptyLine);
        setLineError("");
    };

    const removeLine = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const subtotal = cart.reduce(
        (sum, c) => sum + c.quantity * c.unit_price,
        0
    );

    const discountTotal = cart.reduce((sum, c) => sum + c.discount, 0);

    const taxTotal = cart.reduce((sum, c) => sum + c.tax, 0);

    const grandTotal = subtotal - discountTotal + taxTotal;

    const handleUpdate = async () => {

        setFormError("");

        if (!customerId) {
            setFormError("Please select a customer");
            return;
        }

        if (cart.length === 0) {
            setFormError("Add at least one product");
            return;
        }

        setSaving(true);

        try {

            await updateSale(sale.id, {
                customer_id: Number(customerId),
                payment_method: paymentMethod,
                sales_channel: salesChannel,
                status,
                notes,
                items: cart.map((c) => ({
                    product_id: c.product_id,
                    quantity: c.quantity,
                    unit_price: c.unit_price,
                    discount: c.discount,
                    tax: c.tax
                }))
            });

            onClose();

        } catch (err: any) {

            setFormError(
                err.response?.data?.detail ||
                "Update failed"
            );

        } finally {

            setSaving(false);

        }

    };

    if (!sale) return null;

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >

            <DialogTitle>
                Edit Sale — {sale.invoice_number}
            </DialogTitle>

            <DialogContent>

                {formError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {formError}
                    </Alert>
                )}

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Customer"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                >
                    {(customers || []).map((customer: any) => (
                        <MenuItem key={customer.id} value={customer.id}>
                            {customer.full_name}
                        </MenuItem>
                    ))}
                </TextField>

                <Divider sx={{ my: 2 }} />

                <Typography fontWeight="bold" mb={1}>
                    Add Product
                </Typography>

                {lineError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {lineError}
                    </Alert>
                )}

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Product"
                    name="product_id"
                    value={line.product_id}
                    onChange={handleLineChange}
                >
                    {(products || [])
                        .filter((p: any) => p.status !== "Out of Stock")
                        .map((p: any) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.name}
                            </MenuItem>
                        ))}
                </TextField>

                <Box display="flex" gap={2} flexWrap="wrap">

                    <TextField
                        margin="normal"
                        label="Unit Price"
                        value={line.unit_price}
                        disabled
                        sx={{ flex: 1, minWidth: 120 }}
                    />

                    <TextField
                        margin="normal"
                        type="number"
                        label="Quantity"
                        name="quantity"
                        value={line.quantity}
                        onChange={handleLineChange}
                        sx={{ flex: 1, minWidth: 120 }}
                        error={!!lineError}
                    />

                    <TextField
                        margin="normal"
                        type="number"
                        label="Discount"
                        name="discount"
                        value={line.discount}
                        onChange={handleLineChange}
                        sx={{ flex: 1, minWidth: 120 }}
                    />

                    <TextField
                        margin="normal"
                        type="number"
                        label="Tax"
                        name="tax"
                        value={line.tax}
                        onChange={handleLineChange}
                        sx={{ flex: 1, minWidth: 120 }}
                    />

                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addLineToCart}
                        sx={{ mt: 2, height: 56 }}
                    >
                        Add
                    </Button>

                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography fontWeight="bold" mb={1}>
                    Items ({cart.length})
                </Typography>

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Unit Price</TableCell>
                            <TableCell>Discount</TableCell>
                            <TableCell>Tax</TableCell>
                            <TableCell>Line Total</TableCell>
                            <TableCell align="center">Remove</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cart.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No products added
                                </TableCell>
                            </TableRow>
                        ) : (
                            cart.map((c, i) => (
                                <TableRow key={i}>
                                    <TableCell>{c.product_name}</TableCell>
                                    <TableCell>{c.quantity}</TableCell>
                                    <TableCell>₹{c.unit_price}</TableCell>
                                    <TableCell>₹{c.discount}</TableCell>
                                    <TableCell>₹{c.tax}</TableCell>
                                    <TableCell>
                                        ₹{(
                                            c.quantity * c.unit_price -
                                            c.discount +
                                            c.tax
                                        ).toFixed(2)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeLine(i)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ maxWidth: 300, ml: "auto" }}>

                    <Box display="flex" justifyContent="space-between">
                        <Typography>Subtotal</Typography>
                        <Typography>₹{subtotal.toFixed(2)}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                        <Typography>Discount</Typography>
                        <Typography>- ₹{discountTotal.toFixed(2)}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                        <Typography>Tax</Typography>
                        <Typography>+ ₹{taxTotal.toFixed(2)}</Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box display="flex" justifyContent="space-between">
                        <Typography fontWeight="bold">Grand Total</Typography>
                        <Typography fontWeight="bold" color="primary">
                            ₹{grandTotal.toFixed(2)}
                        </Typography>
                    </Box>

                </Box>

                <Divider sx={{ my: 2 }} />

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Sales Channel"
                    value={salesChannel}
                    onChange={(e) => setSalesChannel(e.target.value)}
                >
                    <MenuItem value="Retail Store">Retail Store</MenuItem>
                    <MenuItem value="Online Store">Online Store</MenuItem>
                    <MenuItem value="Marketplace">Marketplace</MenuItem>
                </TextField>

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </TextField>

                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Payment Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Refunded">Refunded</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>

                <TextField
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

            </DialogContent>

            <DialogActions>

                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleUpdate}
                    disabled={saving}
                >
                    {saving ? "Updating..." : "Update Sale"}
                </Button>

            </DialogActions>

        </Dialog>

    );

}
