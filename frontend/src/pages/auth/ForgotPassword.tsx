import {
    Box,
    Paper,
    Typography,
    TextField,
    Button
} from "@mui/material";

import { useForm } from "react-hook-form";

import { forgotPassword } from "../../api/authApi";

import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

    const navigate = useNavigate();

    const {
        register,
        handleSubmit
    } = useForm();

    const onSubmit = async (data: any) => {

        try {

            await forgotPassword(data);

            navigate("/reset-password", {
                state: {
                    email: data.email
                }
            });

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

                    Forgot Password

                </Typography>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <TextField

                        fullWidth

                        label="Email"

                        margin="normal"

                        {...register("email")}

                    />

                    <Button

                        fullWidth

                        variant="contained"

                        type="submit"

                        sx={{
                            mt: 2
                        }}
                    >

                        Verify Email

                    </Button>

                </form>

            </Paper>

        </Box>

    );

}