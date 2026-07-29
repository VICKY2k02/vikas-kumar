import {
    Box,
    Typography,
    Paper
} from "@mui/material";

interface Props {
    timeline: any[];
}

export default function CustomerTimeline({
    timeline
}: Props) {

    return (
        <Box mt={4}>

            <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
            >
                Customer Timeline
            </Typography>

            {timeline.length === 0 ? (
                <Typography color="text.secondary">
                    No Timeline Available
                </Typography>
            ) : (

                timeline.map((item: any) => (

                    <Box
                        key={item.id}
                        sx={{
                            position: "relative",
                            borderLeft: "3px solid #1976d2",
                            ml: 2,
                            pl: 3,
                            pb: 3
                        }}
                    >

                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                bgcolor: "primary.main",
                                borderRadius: "50%",
                                position: "absolute",
                                left: -7,
                                top: 8
                            }}
                        />

                        <Paper
                            elevation={1}
                            sx={{ p: 2 }}
                        >

                            <Typography fontWeight="bold">
                                {item.action}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {item.description}
                            </Typography>

                            <Typography
                                variant="caption"
                            >
                                {item.created_at}
                            </Typography>

                        </Paper>

                    </Box>

                ))

            )}

        </Box>
    );
}