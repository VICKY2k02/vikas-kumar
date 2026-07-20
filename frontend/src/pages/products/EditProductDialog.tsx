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

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product: any;
  category: any[];
}

export default function EditProductDialog({
  open,
  onClose,
  onSave,
  product,
  category
}: Props) {

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (product) {
      setForm(product);
    }
  }, [product]);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >

      <DialogTitle>
        Edit Product
      </DialogTitle>

      <DialogContent>

        <TextField
          fullWidth
          margin="normal"
          label="Product Name"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          label="SKU"
          name="sku"
          value={form.sku || ""}
          onChange={handleChange}
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label="Category"
          name="category_id"
          value={form.category_id || ""}
          onChange={handleChange}
        >
          {category.map((c) => (
            <MenuItem
              key={c.id}
              value={c.id}
            >
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          margin="normal"
          label="Brand"
          name="brand"
          value={form.brand || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Description"
          name="description"
          value={form.description || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Unit Price"
          name="unit_price"
          value={form.unit_price || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Cost Price"
          name="cost_price"
          value={form.cost_price || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Stock Quantity"
          name="stock_quantity"
          value={form.stock_quantity || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Unit"
          name="unit_of_measure"
          value={form.unit_of_measure || ""}
          onChange={handleChange}
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label="Status"
          name="status"
          value={form.status || "Active"}
          onChange={handleChange}
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

        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => onSave(form)}
        >
          Update
        </Button>

      </DialogActions>

    </Dialog>
  );
}