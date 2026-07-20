import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import "../products/ProductTable.css";

import { TableContainer, Paper } from "@mui/material";

interface Props {
  products: any[];
  onEdit: (p: any) => void;
  onDelete: (id: number) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete
}: Props) {

  return (

    <TableContainer
      component={Paper}
      className="product-table"
    >

      <Table>

        <TableHead>

          <TableRow>

            <TableCell>Name</TableCell>

            <TableCell>SKU</TableCell>

            <TableCell>Brand</TableCell>

            <TableCell>Price</TableCell>

            <TableCell>Stock</TableCell>

            <TableCell>Status</TableCell>

            <TableCell>Actions</TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {products.map((p) => (

            <TableRow key={p.id}>

              <TableCell>{p.name}</TableCell>

              <TableCell>{p.sku}</TableCell>

              <TableCell>{p.brand}</TableCell>

              <TableCell>₹{p.unit_price}</TableCell>

              <TableCell>{p.stock_quantity}</TableCell>

              <TableCell>
                <Chip
                  label={
                    p.stock_quantity <= 0
                      ? "Out of Stock"
                      : p.status
                  }
                  sx={{
                    bgcolor:
                      p.stock_quantity <= 0
                        ? "#d32f2f"
                        : p.status === "Active"
                          ? "#2e7d32"
                          : "#f57c00",
                          
                    color: "#fff",
                    fontWeight: 600
                  }}
                />
              </TableCell>

              <TableCell>

                <IconButton
                  onClick={() => onEdit(p)}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => onDelete(p.id)}
                >
                  <DeleteIcon />
                </IconButton>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>
    </TableContainer>
  );

}