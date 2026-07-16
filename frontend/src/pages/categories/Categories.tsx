import { useEffect, useState } from "react";

import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  IconButton,
  Paper
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getCategories,
  deleteCategory
} from "../../api/categoryApi";

import AddCategoryDialog from "../categories/AddCategoryDialog";
import EditCategoryDialog from "../categories/EditCategoryDialog";

import "../auth/styles/Categories.css"



const Categories = () => {

  const [rows, setRows] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);

  const [selected, setSelected] = useState<any>(null);

  const loadCategories = async () => {

    const res = await getCategories(search);

    setRows(res.data);

  };

  useEffect(() => {

    loadCategories();

  }, [search]);

  const handleDelete = async (id: number) => {

    if (!window.confirm("Delete Category?")) return;

    await deleteCategory(id);

    loadCategories();

  };

  const columns: GridColDef[] = [

    {
      field: "name",
      headerName: "Category",
      flex: 1
    },

    {
      field: "description",
      headerName: "Description",
      flex: 2
    },

    {
      field: "product_count",
      headerName: "Products",
      width: 120
    },

    {
      field: "status",
      headerName: "Status",
      width: 130,

      renderCell: (params) => (

        <Chip

          label={params.value}

          color={
            params.value === "Active"
              ? "success"
              : "default"
          }

        />

      )

    },

    {

      field: "actions",

      headerName: "Actions",

      width: 150,

      sortable: false,

      renderCell: (params) => (

        <>

          <IconButton

            color="primary"

            onClick={() => {

              setSelected(params.row);

              setOpenEdit(true);

            }}

          >

            <EditIcon />

          </IconButton>

          <IconButton

            color="error"

            onClick={() =>

              handleDelete(params.row.id)

            }

          >

            <DeleteIcon />

          </IconButton>

        </>

      )

    }

  ];

  return (

    <Box className="categories-page">

      <Typography
        variant="h4"
        mb={3}
      >
        Categories
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>

        <Box

          display="flex"

          justifyContent="space-between"

          gap={2}

        >

          <TextField

            fullWidth

            placeholder="Search Category"

            value={search}

            onChange={(e) =>

              setSearch(e.target.value)

            }

          />

          <Button

            variant="contained"

            onClick={() =>

              setOpenAdd(true)

            }

          >

            Add Category

          </Button>

        </Box>

      </Paper>

      <Paper>

        <DataGrid

          autoHeight

          rows={rows}

          columns={columns}

          pageSizeOptions={[5, 10, 20]}

        />

      </Paper>

      <AddCategoryDialog

        open={openAdd}

        onClose={() => {

          setOpenAdd(false);

          loadCategories();

        }}

      />

      {

        selected && (

          <EditCategoryDialog
            category={selected}
            open={openEdit}
            onClose={() => {
              setOpenEdit(false);
              loadCategories();
            }}
          />

        )

      }

    </Box>

  );

};

export default Categories;