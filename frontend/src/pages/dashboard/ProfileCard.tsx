import { Box, Typography, Paper, Grid } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../auth/styles/profile.css";

export default function ProfileCard() {

    const { user } = useContext(AuthContext);

    return (
        <Box className="dashboard-container">

            <Typography className="dashboard-title">
                RetailPulse Profile
            </Typography>

            <Typography className="dashboard-subtitle">
                Welcome, {user?.name}
            </Typography>

            <Grid container spacing={2}>

                <Grid container spacing={2}>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper className="dashboard-card">
                        <Typography className="card-title">Name</Typography>
                        <Typography className="card-value">
                            {user?.name}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper className="dashboard-card">
                        <Typography className="card-title">Email</Typography>
                        <Typography className="card-value">
                            {user?.email}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper className="dashboard-card">
                        <Typography className="card-title">Role</Typography>
                        <Typography className="card-value">
                            {user?.role}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper className="dashboard-card">
                        <Typography className="card-title">Company</Typography>
                        <Typography className="card-value">
                            {user?.company_name}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper className="dashboard-card">
                        <Typography className="card-title">Last Login</Typography>
                        <Typography className="card-value">
                            {new Date().toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "medium",
                            })}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Paper className="dashboard-card">
                        <Typography className="card-title">
                            Account Status
                        </Typography>
                        <Typography className="card-value">
                            {user?.status}
                        </Typography>
                    </Paper>
                </Grid>

            </Grid>
            </Grid>

        </Box>
    );
}