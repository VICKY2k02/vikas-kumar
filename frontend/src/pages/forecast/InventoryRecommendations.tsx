import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from "@mui/material";

interface Props {
    forecasts: any[];
}

export default function InventoryRecommendations({
    forecasts
}: Props) {

    return (

        <Paper sx={{ mt: 4, p: 2 }}>

            <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
            >

                Inventory Recommendations

            </Typography>

            <TableContainer>

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                Product
                            </TableCell>

                            <TableCell align="center">
                                Current Stock
                            </TableCell>

                            <TableCell align="center">
                                Predicted Demand
                            </TableCell>

                            <TableCell align="center">
                                Reorder Level
                            </TableCell>

                            <TableCell align="center">
                                Recommendation
                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {forecasts.length === 0 ? (

                            <TableRow>

                                <TableCell
                                    colSpan={5}
                                    align="center"
                                >

                                    No Recommendations

                                </TableCell>

                            </TableRow>

                        ) : (

                            forecasts.map((item: any) => (

                                <TableRow
                                    key={item.id}
                                    hover
                                >

                                    <TableCell>

                                        {item.product_name}

                                    </TableCell>

                                    <TableCell align="center">

                                        {item.current_stock}

                                    </TableCell>

                                    <TableCell align="center">

                                        {item.predicted_demand}

                                    </TableCell>

                                    <TableCell align="center">

                                        {item.reorder_level}

                                    </TableCell>

                                    <TableCell align="center">

                                        <Chip

                                            label={item.recommendation}

                                            color={

                                                item.recommendation ===
                                                "Immediate Restock Required"

                                                    ? "error"

                                                    : item.recommendation ===
                                                      "Reorder Soon"

                                                    ? "warning"

                                                    : item.recommendation ===
                                                      "Overstock Risk"

                                                    ? "secondary"

                                                    : "success"

                                            }

                                        />

                                    </TableCell>

                                </TableRow>

                            ))

                        )}

                    </TableBody>

                </Table>

            </TableContainer>

        </Paper>

    );

}