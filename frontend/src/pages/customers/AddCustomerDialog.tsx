import { useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem
} from "@mui/material";

import {
    createCustomer
} from "../../api/customerApi";

interface Props {

    open: boolean;

    onClose: () => void;

}

export default function AddCustomerDialog({

    open,

    onClose

}: Props) {

    const [form, setForm] = useState({

        full_name: "",

        email: "",

        phone: "",

        date_of_birth: "",

        gender: "",

        address: "",

        city: "",

        state: "",

        country: "",

        postal_code: "",

        customer_type: "Retail",

        preferred_sales_channel: "Store",

        status: "Active"

    });

    const handleChange = (

        e: React.ChangeEvent<HTMLInputElement>

    ) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const errors: {
        full_name?: string;
        email?: string;
        phone?: string;
    } = {};
    if (!form.full_name) {
        errors.full_name = "Full Name is required";
    }

    if (!form.email) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = "Invalid email";
    }

    if (!form.phone) {
        errors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
        errors.phone = "Invalid phone number";
    }

    const handleSave = async () => {

        if (
            errors.full_name ||
            errors.email ||
            errors.phone
        ) {
            return;
        }

        await createCustomer(form);

        setForm({

            full_name: "",

            email: "",

            phone: "",

            date_of_birth: "",

            gender: "",

            address: "",

            city: "",

            state: "",

            country: "",

            postal_code: "",

            customer_type: "Retail",

            preferred_sales_channel: "Store",

            status: "Active"

        });

        onClose();

    };

    return (

        <Dialog

            open={open}

            onClose={onClose}

            fullWidth

            maxWidth="md"

        >

            <DialogTitle>

                Add Customer

            </DialogTitle>

            <DialogContent>

                <TextField

                    fullWidth

                    margin="normal"

                    label="Full Name"

                    name="full_name"

                    value={form.full_name}

                    onChange={handleChange}

                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                />

                <TextField

                    fullWidth

                    margin="normal"

                    type="date"

                    label="Date Of Birth"

                    name="date_of_birth"

                    value={form.date_of_birth}

                    onChange={handleChange}

                    InputLabelProps={{

                        shrink: true

                    }}

                />

                <TextField

                    select

                    fullWidth

                    margin="normal"

                    label="Gender"

                    name="gender"

                    value={form.gender}

                    onChange={handleChange}

                >

                    <MenuItem value="Male">

                        Male

                    </MenuItem>

                    <MenuItem value="Female">

                        Female

                    </MenuItem>

                    <MenuItem value="Other">

                        Other

                    </MenuItem>

                </TextField>

                <TextField

                    fullWidth

                    margin="normal"

                    label="Address"

                    name="address"

                    value={form.address}

                    onChange={handleChange}

                    multiline

                    rows={2}

                />

                <TextField

                    fullWidth

                    margin="normal"

                    label="City"

                    name="city"

                    value={form.city}

                    onChange={handleChange}

                />

                <TextField

                    fullWidth

                    margin="normal"

                    label="State"

                    name="state"

                    value={form.state}

                    onChange={handleChange}

                />

                <TextField

                    fullWidth

                    margin="normal"

                    label="Country"

                    name="country"

                    value={form.country}

                    onChange={handleChange}

                />


                <TextField
                    fullWidth
                    margin="normal"
                    label="Postal Code"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                />


                <TextField

                    select

                    fullWidth

                    margin="normal"

                    label="Customer Type"

                    name="customer_type"

                    value={form.customer_type}

                    onChange={handleChange}

                >

                    <MenuItem value="New">New</MenuItem>
<MenuItem value="Regular">Regular</MenuItem>
<MenuItem value="Loyal">Loyal</MenuItem>
<MenuItem value="VIP">VIP</MenuItem>

                </TextField>

                <TextField

                    select

                    fullWidth

                    margin="normal"

                    label="Preferred Sales Channel"

                    name="preferred_sales_channel"

                    value={form.preferred_sales_channel}

                    onChange={handleChange}

                >

                    <MenuItem value="Store">

                        Store

                    </MenuItem>

                    <MenuItem value="Online">

                        Online

                    </MenuItem>

                    <MenuItem value="Phone">

                        Phone

                    </MenuItem>

                </TextField>

                <TextField

                    select

                    fullWidth

                    margin="normal"

                    label="Status"

                    name="status"

                    value={form.status}

                    onChange={handleChange}

                >

                    <MenuItem value="Active">

                        Active

                    </MenuItem>

                    <MenuItem value="Inactive">

                        Inactive

                    </MenuItem>

                </TextField>

            </DialogContent>

            <DialogActions>

                <Button

                    onClick={onClose}

                >

                    Cancel

                </Button>

                <Button

                    variant="contained"

                    onClick={handleSave}

                >

                    Save

                </Button>

            </DialogActions>

        </Dialog>

    );

}