import { useMemo, useState } from "react";

import {
    Card,
    CardContent,
    Typography,
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper
} from "@mui/material";

interface ProductData {
    product: string;
    quantity: number;
    revenue: number;
}

interface Props {
    data?: ProductData[];
}

export default function TopProductsChart({
    data = []
}: Props) {

    const [sortBy, setSortBy] =
        useState<"revenue" | "quantity">("revenue");


    const sortedProducts = useMemo(() => {

        return [...data].sort((a, b) => {

            if (sortBy === "revenue") {
                return b.revenue - a.revenue;
            }

            return b.quantity - a.quantity;

        });

    }, [data, sortBy]);


    const handleSortChange = (
        _event: React.MouseEvent<HTMLElement>,
        value: "revenue" | "quantity" | null
    ) => {

        if (value) {
            setSortBy(value);
        }

    };


    return (

        <Card sx={{ mt: 3 }}>

            <CardContent>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                    mb={2}
                >

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                    >
                        Top Performing Products
                    </Typography>


                    <ToggleButtonGroup
                        value={sortBy}
                        exclusive
                        size="small"
                        onChange={handleSortChange}
                    >

                        <ToggleButton value="revenue">
                            Revenue
                        </ToggleButton>

                        <ToggleButton value="quantity">
                            Quantity Sold
                        </ToggleButton>

                    </ToggleButtonGroup>

                </Box>


                {sortedProducts.length === 0 ? (

                    <Box
                        sx={{
                            py: 6,
                            textAlign: "center"
                        }}
                    >

                        <Typography color="text.secondary">
                            No product sales data available
                            for the selected period.
                        </Typography>

                    </Box>

                ) : (

                    <TableContainer
                        component={Paper}
                        variant="outlined"
                    >

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        <strong>Product Name</strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>Units Sold</strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>Revenue</strong>
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {sortedProducts.map(
                                    (item, index) => (

                                        <TableRow
                                            key={`${item.product}-${index}`}
                                        >

                                            <TableCell>
                                                {item.product}
                                            </TableCell>

                                            <TableCell align="right">
                                                {item.quantity.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </TableCell>

                                            <TableCell align="right">
                                                ₹
                                                {item.revenue.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )}
                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                )}

            </CardContent>

        </Card>

    );
}