import { useState } from "react";

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton
} from "@mui/material";

import {
    Visibility,
    VisibilityOff
} from "@mui/icons-material";

import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../api/authApi";

interface LoginForm {

    email: string;

    password: string;

}

const Login = () => {

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const [showPassword, setShowPassword] = useState(false);

    const {

        register,

        handleSubmit,

        formState: { errors }

    } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {

    try {

        const response = await loginUser(data);

        login(
            response.data.user,
            response.data.access_token
        );

        localStorage.setItem(
            "refresh_token",
            response.data.refresh_token
        );

        navigate("/dashboard");

    } catch (error) {

        alert("Invalid Email or Password");

    }

};

    return (


        <Box className="auth-container"
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh"
            }}
        >

            <Paper
                elevation={6}
                sx={{
                    width: 420,
                    padding: 4,
                    borderRadius: 3
                }}
            >

                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                >

                    RetailPulse

                </Typography>

                <Typography
                    align="center"
                    mb={3}
                >

                    Login

                </Typography>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <TextField

                        fullWidth

                        label="Email"

                        margin="normal"

                        {...register("email", {

                            required: "Email Required"

                        })}

                        error={!!errors.email}

                        helperText={errors.email?.message}

                    />

                    <TextField

                        fullWidth

                        label="Password"

                        margin="normal"

                        type={showPassword ? "text" : "password"}

                        {...register("password", {

                            required: "Password Required"

                        })}

                        error={!!errors.password}

                        helperText={errors.password?.message}

                        InputProps={{

                            endAdornment: (

                                <InputAdornment position="end">

                                    <IconButton

                                        onClick={() =>

                                            setShowPassword(

                                                !showPassword

                                            )

                                        }

                                    >

                                        {

                                            showPassword ?

                                                <VisibilityOff />

                                                :

                                                <Visibility />

                                        }

                                    </IconButton>

                                </InputAdornment>

                            )

                        }}

                    />

                    <Button

                        fullWidth

                        type="submit"

                        variant="contained"

                        sx={{

                            mt: 3,

                            py: 1.5

                        }}

                    >

                        Login

                    </Button>

                    <Button
                        onClick={() =>
                            navigate("/forgot-password")
                        }
                    >

                        Forgot Password?

                    </Button>

                </form>

                <Typography

                    mt={2}

                    align="center"

                >

                    New Company?

                    <Link to="/register">

                        Register

                    </Link>

                </Typography>

            </Paper>

        </Box>

    );

};

export default Login;