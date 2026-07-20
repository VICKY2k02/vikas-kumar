import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Divider
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  sale: any;
}

export default function SaleDetailsDialog({
  open,
  onClose,
  sale
}: Props) {

  if (!sale) return null;

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
          sx={{
            p: 3,
            mt: 1
          }}
        >

          <Typography variant="h6">

            {sale.invoice_number}

          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>

            <Grid item xs={6}>

              <Typography>

                <b>Customer</b>

              </Typography>

              <Typography>

                {sale.customer_name}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Sale Date</b>

              </Typography>

              <Typography>

                {new Date(
                  sale.sale_date
                ).toLocaleString()}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Product</b>

              </Typography>

              <Typography>

                {sale.product_name}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Category</b>

              </Typography>

              <Typography>

                {sale.category_name}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Quantity</b>

              </Typography>

              <Typography>

                {sale.quantity}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Unit Price</b>

              </Typography>

              <Typography>

                ₹{sale.unit_price}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Discount</b>

              </Typography>

              <Typography>

                ₹{sale.discount}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Tax</b>

              </Typography>

              <Typography>

                ₹{sale.tax}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Total Amount</b>

              </Typography>

              <Typography
                color="primary"
                fontWeight="bold"
              >

                ₹{sale.total_amount}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Sales Channel</b>

              </Typography>

              <Typography>

                {sale.sales_channel}

              </Typography>

            </Grid>

            <Grid item xs={6}>

              <Typography>

                <b>Payment Method</b>

              </Typography>

              <Typography>

                {sale.payment_method}

              </Typography>

            </Grid>

          </Grid>

        </Paper>

      </DialogContent>

      <DialogActions>

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