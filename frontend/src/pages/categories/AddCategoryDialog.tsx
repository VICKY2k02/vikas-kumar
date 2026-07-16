import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from "@mui/material";

import { createCategory } from "../../api/categoryApi";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddCategoryDialog = ({
  open,
  onClose,
}: Props) => {

  const [form, setForm] = useState({

    name: "",

    description: "",

    status: "Active",

  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value,

    });

  };

  const handleSave = async () => {

    if (!form.name.trim()) {

      alert("Category Name is required");

      return;

    }

    try {

      await createCategory(form);

      setForm({

        name: "",

        description: "",

        status: "Active",

      });

      onClose();

    } catch (err: any) {

      alert(

        err.response?.data?.detail ||

        "Unable to create category"

      );

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

        Add Category

      </DialogTitle>

      <DialogContent>

        <TextField

          fullWidth

          margin="normal"

          label="Category Name"

          name="name"

          value={form.name}

          onChange={handleChange}

        />

        <TextField

          fullWidth

          margin="normal"

          multiline

          rows={3}

          label="Description"

          name="description"

          value={form.description}

          onChange={handleChange}

        />

        <TextField

          fullWidth

          margin="normal"

          select

          label="Status"

          name="status"

          value={form.status}

          onChange={handleChange}

        >

          <MenuItem value="Active">

            Active

          </MenuItem>

          <MenuItem value="Inactive">

            Inactive

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

          onClick={handleSave}

        >

          Save

        </Button>

      </DialogActions>

    </Dialog>

  );

};

export default AddCategoryDialog;