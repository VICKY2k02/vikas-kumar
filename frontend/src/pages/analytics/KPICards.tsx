import {
    Grid,
    Card,
    CardContent,
    Typography
} from "@mui/material";

interface Props {
    summary: any;
}

const cards = [
    {
        title: "Total Revenue",
        key: "total_revenue"
    },
    {
        title: "Total Orders",
        key: "total_orders"
    },
    {
        title: "Products Sold",
        key: "total_products_sold"
    },
    {
        title: "Average Order Value",
        key: "average_order_value"
    },
    {
        title: "Inventory Value",
        key: "total_inventory_value"
    },
    {
        title: "Low Stock",
        key: "low_stock_products"
    },
    {
        title: "Out Of Stock",
        key: "out_of_stock_products"
    },
    {
        title: "Categories",
        key: "total_categories"
    }
];

export default function KPICards({ summary }: Props) {

    return (

        <Grid container spacing={2}>

            {cards.map((card) => (

                <Grid item xs={12} sm={6} md={3} key={card.key}>

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            cursor: "pointer"
                        }}
                    >

                        <CardContent>

                            <Typography
                                color="text.secondary"
                                gutterBottom
                            >
                                {card.title}
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                            >
                                {summary?.[card.key] ?? 0}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            ))}

        </Grid>

    );
}