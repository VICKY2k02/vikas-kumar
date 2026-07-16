import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Paper,
  Typography,
  TextField
} from "@mui/material";

import ProductTable from "./ProductTable";

import AddProductDialog from "../products/AddProductDialog";
import EditProductDialog from "../products/EditProductDialog";

import {
  getProducts,
  deleteProduct,
  updateProduct
} from "../../api/productApi";

import { getCategories } from "../../api/categoryApi";

export default function Products() {

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<any>(null);

  const loadProducts = async () => {

    const res = await getProducts(search);

    setProducts(res.data);

  };

  const loadCategories = async () => {

    const res = await getCategories();

    setCategories(res.data);

  };

  useEffect(() => {

    loadProducts();

    loadCategories();

  }, [search]);

  const handleDelete = async (id: number) => {

    if (!window.confirm("Delete Product?"))
      return;

    await deleteProduct(id);

    loadProducts();

  };

  const handleUpdate = async (product: any) => {

    await updateProduct(
      product.id,
      product
    );

    setOpenEdit(false);

    loadProducts();

  };

  return (

    <Box p={3}>

      <Typography
        variant="h4"
        mb={3}
      >

        Products

      </Typography>

      <Paper sx={{ p:2, mb:2 }}>

        <Box
          display="flex"
          gap={2}
          justifyContent="space-between"
        >

          <TextField

            fullWidth

            placeholder="Search Product"

            value={search}

            onChange={(e)=>

              setSearch(e.target.value)

            }

          />

          <Button

            variant="contained"

            onClick={()=>setOpenAdd(true)}

          >

            Add Product

          </Button>

        </Box>

      </Paper>

      <Paper sx={{p:2}}>

        <ProductTable

          products={products}

          onEdit={(p)=>{

            setSelectedProduct(p);

            setOpenEdit(true);

          }}

          onDelete={handleDelete}

        />

      </Paper>

      <AddProductDialog

        open={openAdd}

        onClose={()=>{

          setOpenAdd(false);

          loadProducts();

        }}

        categories={categories}

      />

      {

        selectedProduct &&

        <EditProductDialog

          open={openEdit}

          onClose={()=>{

            setOpenEdit(false);

            loadProducts();

          }}

          product={selectedProduct}

          category={categories}

          onSave={handleUpdate}

        />

      }

    </Box>

  );

}