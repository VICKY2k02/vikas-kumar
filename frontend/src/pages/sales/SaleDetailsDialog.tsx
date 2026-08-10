import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Divider,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box
} from "@mui/material";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

import {
  exportInvoicePDF,
  exportInvoiceCSV
} from "../../api/salesApi";

interface Props {
  open: boolean;
  onClose: () => void;
  sale: any;
}

function downloadBlob(blob: Blob, fileName: string) {

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

export default function SaleDetailsDialog({
  open,
  onClose,
  sale
}: Props) {

  if (!sale) return null;

  const items = sale.items || [];

  const handleExportPDF = async () => {

    try {
      const res = await exportInvoicePDF(sale.id);
      downloadBlob(res.data, `invoice_${sale.invoice_number}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF");
    }

  };

  const handleExportCSV = async () => {

    try {
      const res = await exportInvoiceCSV(sale.id);
      downloadBlob(res.data, `invoice_${sale.invoice_number}.csv`);
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV");
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
        Invoice Details
      </DialogTitle>

      <DialogContent>

        <Paper
          elevation={2}
          sx={{ p: 3, mt: 1 }}
        >

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {sale.invoice_number}
            </Typography>

            <Chip
              label={sale.status || "-"}
              color={
                sale.status === "Paid"
                  ? "success"
                  : sale.status === "Pending"
                  ? "warning"
                  : "error"
              }
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Invoice Information */}
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Invoice Information
          </Typography>

          <Grid container spacing={2} mb={2}>

            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Customer
              </Typography>
              <Typography>{sale.customer_name || "-"}</Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Sale Date
              </Typography>
              <Typography>
                {sale.sale_date
                  ? new Date(sale.sale_date).toLocaleString()
                  : "-"}
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography>{sale.payment_method || "-"}</Typography>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Salesperson
              </Typography>
              <Typography>{sale.salesperson_name || "-"}</Typography>
            </Grid>

          </Grid>

          {sale.notes && (
            <>
              <Typography variant="body2" color="text.secondary">
                Notes
              </Typography>
              <Typography mb={2}>{sale.notes}</Typography>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Purchased Products */}
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Purchased Products
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Line Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No items
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name || "-"}</TableCell>
                    <TableCell>{item.sku || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.unit_price}</TableCell>
                    <TableCell>₹{item.total}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          {/* Pricing Summary */}
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Pricing Summary
          </Typography>

          <Box sx={{ maxWidth: 300, ml: "auto" }}>

            <Box display="flex" justifyContent="space-between">
              <Typography>Subtotal</Typography>
              <Typography>₹{sale.subtotal ?? 0}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography>Discount</Typography>
              <Typography>- ₹{sale.discount ?? 0}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography>Tax</Typography>
              <Typography>+ ₹{sale.tax ?? 0}</Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">Grand Total</Typography>
              <Typography color="primary" fontWeight="bold">
                ₹{sale.total_amount ?? 0}
              </Typography>
            </Box>

          </Box>

        </Paper>

      </DialogContent>

      <DialogActions>

        <Button
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>

        <Button
          startIcon={<DescriptionIcon />}
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>

        <Button
          variant="contained"
          onClick={onClose}
        >
          Close
        </Button>

      </DialogActions>

    </Dialog>

  );

}
