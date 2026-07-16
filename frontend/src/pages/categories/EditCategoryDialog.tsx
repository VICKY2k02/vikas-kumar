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
import { updateCategory } from "../../api/categoryApi";

interface Props {
  open: boolean;
  onClose: () => void;
  category: any;
}

export default function EditCategoryDialog({
  open,
  onClose,
  category
}: Props) {


    
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setStatus(category.status);
    }
  }, [category]);

  const handleUpdate = async () => {
    await updateCategory(category.id, {
      name,
      description,
      status
    });

    onClose();
  };

  return (
    <Dialog open={open} fullWidth>

      <DialogTitle>Edit Category</DialogTitle>

      <DialogContent>

        <TextField
          fullWidth
          margin="normal"
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleUpdate}
        >
          Update
        </Button>

      </DialogActions>

    </Dialog>
  );
}