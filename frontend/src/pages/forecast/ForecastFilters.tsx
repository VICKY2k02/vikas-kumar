import {
  Box,
  TextField,
  MenuItem
} from "@mui/material";

interface Props {
  search: string;
  category: string;
  setSearch: (value: string) => void;
  setCategory: (value: string) => void;
}

export default function ForecastFilters({
  search,
  category,
  setSearch,
  setCategory
}: Props) {
  return (
    <Box display="flex" gap={2} mb={2}>

      <TextField
        label="Search Product"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
      />

      <TextField
        select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        sx={{ width: 220 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Electronics">Electronics</MenuItem>
        <MenuItem value="Fashion">Fashion</MenuItem>
        <MenuItem value="Grocery">Grocery</MenuItem>
      </TextField>

    </Box>
  );
}