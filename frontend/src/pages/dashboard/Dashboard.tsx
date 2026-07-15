// import {
//   Box,
//   Typography,
//   Paper,
//   Grid
// } from "@mui/material";

// import "../../pages/auth/styles/dashboard.css";


// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";

// const Dashboard = () => {

//   const { user } = useContext(AuthContext);


//     return (

//     <Box className="dashboard-container">

//         <Typography className="dashboard-title">

//             RetailPulse Dashboard

//         </Typography>

//         <Typography className="dashboard-subtitle">

//             Welcome, {user?.name}

//         </Typography>

//         <Grid container spacing={3}>

//             <Grid item xs={12} md={3}>

//                 <Paper className="dashboard-card">

//                     <Typography className="card-title">

//                         Company

//                     </Typography>

//                     <Typography className="card-value">

//                         {user?.company_name || user?.company_id}

//                     </Typography>

//                 </Paper>

//             </Grid>

//             <Grid item xs={12} md={3}>

//                 <Paper className="dashboard-card">

//                     <Typography className="card-title">

//                         Role

//                     </Typography>

//                     <Typography className="card-value">

//                         {user?.role}

//                     </Typography>

//                 </Paper>

//             </Grid>

//             <Grid item xs={12} md={3}>

//                 <Paper className="dashboard-card">

//                     <Typography className="card-title">

//                         Status

//                     </Typography>

//                     <Typography className="card-value">

//                         Active

//                     </Typography>

//                 </Paper>

//             </Grid>

//             <Grid item xs={12} md={3}>

//                 <Paper className="dashboard-card">

//                     <Typography className="card-title">

//                         Last Login

//                     </Typography>

//                     <Typography className="card-value">

//                         {user?.last_login || "Today"}

//                     </Typography>

//                 </Paper>

//             </Grid>

//         </Grid>

//     </Box>

// );

// };

// export default Dashboard;
import {
  Box,
  Typography,
  Paper,
  Grid
} from "@mui/material";

import "../../pages/auth/styles/dashboard.css";

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Dashboard = () => {

  const { user } = useContext(AuthContext);

  return (
    <Box className="dashboard-container">

      <Typography className="dashboard-title">
        RetailPulse Dashboard
      </Typography>

      <Typography className="dashboard-subtitle">
        Welcome, {user?.name}
      </Typography>

      <Grid container spacing={3}>

        <Grid item xs={12} md={4}>
          <Paper className="dashboard-card">
            <Typography className="card-title">Name</Typography>
            <Typography className="card-value">
              {user?.name}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="dashboard-card">
            <Typography className="card-title">Email</Typography>
            <Typography className="card-value">
              {user?.email}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="dashboard-card">
            <Typography className="card-title">Role</Typography>
            <Typography className="card-value">
              {user?.role}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="dashboard-card">
            <Typography className="card-title">Company</Typography>
            <Typography className="card-value">
              {user?.company_name}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="dashboard-card">
            <Typography className="card-title">Last Login</Typography>
            <Typography className="card-value">
              {user?.last_login
                ? new Date(user.last_login).toLocaleString()
                : "First Login"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
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

    </Box>
  );
};

export default Dashboard;