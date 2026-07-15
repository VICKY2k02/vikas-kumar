import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    // MenuItem
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { registerCompany } from "../../api/authApi";

import "../auth/styles/Register.css";

const Register = () => {

    const navigate = useNavigate();

    const {

        register,

        handleSubmit

    } = useForm();

    const onSubmit = async (data: any) => {


        const company = JSON.parse(
            localStorage.getItem("user") || "{}"
        );

        data.company_id = company.company_id;

        try {

            await registerCompany(data);

            alert("Company Registered Successfully");

            navigate("/login");

        }

        catch (error: any) {
            console.log(error.response?.data);
            alert(error.response?.data?.detail || "Registration Failed");
        }

    };

    return (

        <Box className="register-page"
            sx={{
                display: "flex",
                justifyContent: "center",
                py: 5
            }}
        >

            <Paper className="register-card"

                sx={{

                    width: 700,

                    p: 4

                }}

            >

                <Typography
                    className="register-title"
                >

                    RetailPulse

                </Typography>

                <Typography
                    className="register-subtitle"
                >

                    Create Company Account

                </Typography>

                <form

                    onSubmit={handleSubmit(onSubmit)}

                >

                    <Grid container spacing={1.5}>
                        
                        <Grid item xs={12} md={6}>

                            <TextField

                                fullWidth

                                label="Company Name"

                                {...register("company_name")}

                            />

                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField

                                fullWidth

                                label="Industry"

                                {...register("industry")}

                            />

                        </Grid>

                        <Grid item xs={12}>
                            <TextField

                                fullWidth

                                label="Company Email"

                                {...register("company_email")}

                            />

                        </Grid>

                        <Grid item xs={12}>

                            <TextField

                                fullWidth

                                label="Company Address"

                                {...register("company_address")}

                            />

                        </Grid>

                        <Grid item xs={12} md={6}>

                            <TextField

                                fullWidth

                                label="Company Phone"

                                {...register("company_phone")}

                            />

                        </Grid>

                        <Grid item xs={12} md={6}>

                            <TextField

                                fullWidth

                                label="Owner Name"

                                {...register("owner_name")}

                            />

                        </Grid>

                        <Grid item xs={12}>

                            <TextField

                                fullWidth

                                label="Owner Email"

                                {...register("owner_email")}

                            />

                        </Grid>

                        {/* <Grid item xs={12}>

                            <TextField

                                select

                                fullWidth

                                label="Role"

                                defaultValue="User"

                                {...register("role")}

                            >

                                <MenuItem value="User">
                                    User
                                </MenuItem>

                                <MenuItem value="Company Admin">
                                    Admin
                                </MenuItem>

                            </TextField>

                        </Grid> */}

                        <Grid item xs={12} md={6}>

                            <TextField

                                fullWidth

                                type="password"

                                label="Password"

                                {...register("password")}

                            />

                        </Grid>

                        <Grid item xs={12} md={6}>

                            <TextField

                                fullWidth

                                type="password"

                                label="Confirm Password"

                                {...register("confirm_password")}

                            />

                        </Grid>

                        <Grid item xs={12}>

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                className="register-btn"
                            >

                                Register Company

                            </Button>

                        </Grid>

                    </Grid>

                </form>

            </Paper>

        </Box>

    );

};

export default Register;