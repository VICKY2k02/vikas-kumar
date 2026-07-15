import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    MenuItem
} from "@mui/material";

import { useForm } from "react-hook-form";

import { registerUser } from "../../api/authApi";

const AddUser = () => {

    const {

        register,

        handleSubmit

    } = useForm();

    const onSubmit = async (data: any) => {

        const user = JSON.parse(
            localStorage.getItem("user") || "{}"
        );

        data.company_id = user.company_id;

        try {

            await registerUser(data);

            alert("User Created Successfully");

        }

        catch (error: any) {

            alert(
                error.response?.data?.detail
            );

        }

    };

    return (

        <Box
            display="flex"
            justifyContent="center"
            mt={5}
        >

            <Paper
                sx={{
                    p:4,
                    width:500
                }}
            >

                <Typography
                    variant="h5"
                    mb={3}
                >

                    Add User

                </Typography>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <Grid container spacing={2}>

                        <Grid item xs={12}>

                            <TextField
                                fullWidth
                                label="Name"
                                {...register("name")}
                            />

                        </Grid>

                        <Grid item xs={12}>

                            <TextField
                                fullWidth
                                label="Email"
                                {...register("email")}
                            />

                        </Grid>

                        <Grid item xs={12}>

                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                {...register("password")}
                            />

                        </Grid>

                        <Grid item xs={12}>

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                {...register("confirm_password")}
                            />

                        </Grid>

                        <Grid item xs={12}>

                            <TextField
                                select
                                fullWidth
                                defaultValue="User"
                                label="Role"
                                {...register("role")}
                            >

                                <MenuItem value="User">
                                    User
                                </MenuItem>

                                <MenuItem value="Company Admin">
                                    Company Admin
                                </MenuItem>

                            </TextField>

                        </Grid>

                        <Grid item xs={12}>

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                            >

                                Create User

                            </Button>

                        </Grid>

                    </Grid>

                </form>

            </Paper>

        </Box>

    );

};

export default AddUser;