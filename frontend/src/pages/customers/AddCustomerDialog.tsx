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

    const handleSave = async () => {

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

                />

                <TextField

                    fullWidth

                    margin="normal"

                    label="Phone"

                    name="phone"

                    value={form.phone}

                    onChange={handleChange}

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

                    select

                    fullWidth

                    margin="normal"

                    label="Customer Type"

                    name="customer_type"

                    value={form.customer_type}

                    onChange={handleChange}

                >

                    <MenuItem value="Retail">

                        Retail

                    </MenuItem>

                    <MenuItem value="Wholesale">

                        Wholesale

                    </MenuItem>

                    <MenuItem value="Corporate">

                        Corporate

                    </MenuItem>

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