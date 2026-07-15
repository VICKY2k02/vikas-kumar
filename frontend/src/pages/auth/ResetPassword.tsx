import {
    Box,
    Paper,
    Typography,
    TextField,
    Button
} from "@mui/material";

import {
    useForm
} from "react-hook-form";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    resetPassword
} from "../../api/authApi";

export default function ResetPassword() {

    const location = useLocation();

    const navigate = useNavigate();

    const email = location.state.email;

    const {
        register,
        handleSubmit
    } = useForm();

    const onSubmit = async (data: any) => {

        try {

            await resetPassword({

                email,

                password: data.password,

                confirm_password: data.confirm_password

            });

            alert(
                "Password Updated Successfully"
            );

            navigate("/login");

        }
        catch (err: any) {

            alert(
                err.response?.data?.detail
            );

        }

    };

    return (

        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                mt: 8
            }}
        >

            <Paper
                sx={{
                    p: 4,
                    width: 450
                }}
            >

                <Typography
                    variant="h5"
                    mb={3}
                >

                    Reset Password

                </Typography>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <TextField

                        type="password"

                        label="New Password"

                        fullWidth

                        margin="normal"

                        {...register("password")}

                    />

                    <TextField

                        type="password"

                        label="Confirm Password"

                        fullWidth

                        margin="normal"

                        {...register("confirm_password")}

                    />

                    <Button

                        type="submit"

                        variant="contained"

                        fullWidth

                        sx={{
                            mt: 2
                        }}
                    >

                        Reset Password

                    </Button>

                </form>

            </Paper>

        </Box>

    );

}