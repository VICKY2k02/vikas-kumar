import {
    Grid,
    Card,
    CardContent,
    Typography
} from "@mui/material";

interface Props {
    dashboard: any;
}

export default function ForecastKPICards({
    dashboard
}: Props) {

    const cards = [

        {
            title: "Total Predicted Demand",
            value:
                dashboard?.total_predicted_demand ?? 0,
            // color: "#1976d2"
        },

        {
            title: "Products Expected To Run Out",
            value:
                dashboard?.products_to_run_out ?? 0,
            // color: "#d32f2f"
        },

        {
            title: "High Growth Products",
            value:
                dashboard?.high_growth_products ?? 0,
            // color: "#2e7d32"
        },

        {
            title: "Slow Moving Products",
            value:
                dashboard?.slow_moving_products ?? 0,
            // color: "#ed6c02"
        },

        {
            title: "Forecast Accuracy",
            value:
                `${dashboard?.forecast_accuracy ?? 0}%`,
            // color: "#6a1b9a"
        }

    ];

    return (

        <Grid container spacing={3}>

            {cards.map((card) => (

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={2.4 as any}
                    key={card.title}
                >

                    <Card
    sx={{
        height: "100%",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "all .3s ease",
        backgroundColor: "#fff",

        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            borderColor: "#1976d2"
        }
    }}
>

                        <CardContent
    sx={{
        padding: "20px !important"
    }}
>

                            <Typography
    variant="body2"
    sx={{
        color: "#6b7280",
        fontWeight: 600,
        mb: 1
    }}
>
    {card.title}
</Typography>

                            <Typography
    sx={{
        fontSize: "30px",
        fontWeight: 700,
        color: "#111827"
    }}
>
    {card.value}
</Typography>

                        </CardContent>

                    </Card>

                </Grid>

            ))}

        </Grid>

    );

}