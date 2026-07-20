import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from "@mui/material";

import { useState, useEffect } from "react";

import { updateSale } from "../../api/salesApi";

interface Props {

  open: boolean;

  onClose: () => void;

  sale: any;

  products: any[];

}

export default function EditSaleDialog({

  open,

  onClose,

  sale,

  products

}: Props) {

  const [form, setForm] = useState<any>({});

  useEffect(() => {

    if (sale) {

      setForm({

        customer_name: sale.customer_name,

        product_id: sale.product_id,

        quantity: sale.quantity,

        unit_price: sale.unit_price,

        discount: sale.discount,

        tax: sale.tax,

        sales_channel: sale.sales_channel,

        payment_method: sale.payment_method

      });

    }

  }, [sale]);

  const change = (e: any) => {

    const { name, value } = e.target;

    if (name === "product_id") {

      const product = products.find(

        (p) => p.id === Number(value)

      );

      setForm({

        ...form,

        product_id: Number(value),

        unit_price: product?.unit_price || 0

      });

      return;

    }

    setForm({

      ...form,

      [name]: value

    });

  };

  const update = async () => {

    try {

      await updateSale(

        sale.id,

        {

          ...form,

          quantity: Number(form.quantity),

          unit_price: Number(form.unit_price),

          discount: Number(form.discount),

          tax: Number(form.tax)

        }

      );

      alert("Sale Updated Successfully");

      onClose();

    }

    catch (err: any) {

      alert(

        err.response?.data?.detail ||

        "Update Failed"

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

        Edit Sale

      </DialogTitle>

      <DialogContent>

        <TextField

          fullWidth

          margin="normal"

          label="Customer Name"

          name="customer_name"

          value={form.customer_name || ""}

          onChange={change}

        />

        <TextField

          select

          fullWidth

          margin="normal"

          label="Product"

          name="product_id"

          value={form.product_id || ""}

          onChange={change}

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

          label="Unit Price"

          value={form.unit_price || 0}

          disabled

        />

        <TextField

          fullWidth

          margin="normal"

          label="Quantity"

          type="number"

          name="quantity"

          value={form.quantity || 1}

          onChange={change}

        />

        <TextField

          fullWidth

          margin="normal"

          label="Discount"

          type="number"

          name="discount"

          value={form.discount || 0}

          onChange={change}

        />

        <TextField

          fullWidth

          margin="normal"

          label="Tax"

          type="number"

          name="tax"

          value={form.tax || 0}

          onChange={change}

        />

        <TextField

          select

          fullWidth

          margin="normal"

          label="Sales Channel"

          name="sales_channel"

          value={form.sales_channel || ""}

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

          value={form.payment_method || ""}

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

          onClick={update}

        >

          Update

        </Button>

      </DialogActions>

    </Dialog>

  );

}