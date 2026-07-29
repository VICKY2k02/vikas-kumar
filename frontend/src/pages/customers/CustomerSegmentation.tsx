import {
    Card,
    CardContent,
    Typography,
    Chip,
    Stack
} from "@mui/material";

interface Props{
    segments:any[];
}

export default function CustomerSegmentation({
    segments
}:Props){

    return(

        <Card sx={{mt:4}}>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Customer Segmentation
                </Typography>

                <Stack spacing={2}>

                    {

                        segments.map((item:any)=>(

                            <Stack

                                key={item.customer_id}

                                direction="row"

                                justifyContent="space-between"

                            >

                                <Typography>

                                    {item.name}

                                </Typography>

                                <Chip

                                    label={item.segment}

                                    color={
                                        item.segment==="VIP Customer"
                                        ?"error"
                                        :item.segment==="Loyal Customer"
                                        ?"success"
                                        :item.segment==="Regular Customer"
                                        ?"primary"
                                        :"default"
                                    }

                                />

                            </Stack>

                        ))

                    }

                </Stack>

            </CardContent>

        </Card>

    );

}