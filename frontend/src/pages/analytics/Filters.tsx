import {
    Box,
    TextField,
    MenuItem,
    Button,
    Stack
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

interface Props {
    startDate: string;
    endDate: string;
    category: string;
    brand: string;
    paymentMethod: string;
    salesChannel: string;

    categories: any[];
    brands: string[];

    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;
    setCategory: (value: string) => void;
    setBrand: (value: string) => void;
    setPaymentMethod: (value: string) => void;
    setSalesChannel: (value: string) => void;


    onRefresh: () => void;

    onExport: (format: "csv" | "pdf") => void;

}

export default function Filters({

    startDate,
    endDate,
    category,
    brand,
    paymentMethod,
    salesChannel,

    categories,
    brands,

    setStartDate,
    setEndDate,
    setCategory,
    setBrand,
    setPaymentMethod,
    setSalesChannel,

    onRefresh,
    onExport

}: Props) {

    return (

        <Box
            display="flex"
            gap={2}
            mb={3}
            flexWrap="wrap"
        >

            <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                select
                label="Category"
                value={category}
                sx={{ width: 180 }}
                onChange={(e) => setCategory(e.target.value)}
            >
                <MenuItem value="">All</MenuItem>

                {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                        {c.name}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                label="Brand"
                value={brand}
                sx={{ width: 180 }}
                onChange={(e) => setBrand(e.target.value)}
            >
                <MenuItem value="">All</MenuItem>

                {brands.map((b) => (
                    <MenuItem key={b} value={b}>
                        {b}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                label="Payment"
                value={paymentMethod}
                sx={{ width: 180 }}
                onChange={(e) => setPaymentMethod(e.target.value)}
            >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
            </TextField>

            <TextField
                select
                label="Channel"
                value={salesChannel}
                sx={{ width: 180 }}
                onChange={(e) => setSalesChannel(e.target.value)}
            >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Store">Store</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2}>

                <Button
                    variant="contained"
                    onClick={onRefresh}
                >
                    Refresh
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => onExport("csv")}
                >
                    Export CSV
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => onExport("pdf")}
                >
                    Export PDF
                </Button>

            </Stack>

        </Box>

    );
}