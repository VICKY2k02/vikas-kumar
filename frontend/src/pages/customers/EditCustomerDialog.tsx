import { useEffect, useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem
} from "@mui/material";

import { updateCustomer } from "../../api/customerApi";

interface Props {

    open: boolean;

    customer: any;

    onClose: () => void;

}

export default function EditCustomerDialog({

    open,

    customer,

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

        customer_type: "",

        preferred_sales_channel: "",

        status: ""

    });

    useEffect(() => {

        if (customer) {

            setForm({

                full_name: customer.full_name,

                email: customer.email,

                phone: customer.phone,

                date_of_birth: customer.date_of_birth || "",

                gender: customer.gender || "",

                address: customer.address || "",

                city: customer.city || "",

                state: customer.state || "",

                country: customer.country || "",

                customer_type: customer.customer_type,

                preferred_sales_channel:
                    customer.preferred_sales_channel,

                status: customer.status

            });

        }

    }, [customer]);

    const handleChange = (

        e: React.ChangeEvent<HTMLInputElement>

    ) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleSave = async () => {

    try {

        await updateCustomer(
            customer.id,
            form
        );

        onClose();

    } catch (err) {

        console.error(err);

        alert("Failed to update customer");

    }

};

    return (

        <Dialog

            open={open}

            onClose={onClose}

            fullWidth

            maxWidth="md"

        >

            <DialogTitle>

                Edit Customer

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
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>

                <TextField
                    fullWidth
                    margin="normal"
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
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
                    <MenuItem value="Retail">Retail</MenuItem>
                    <MenuItem value="Wholesale">Wholesale</MenuItem>
                    <MenuItem value="Corporate">Corporate</MenuItem>
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
                    <MenuItem value="Store">Store</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                    <MenuItem value="Phone">Phone</MenuItem>
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
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>

            </DialogContent>

            <DialogActions>

                <Button onClick={onClose}>

                    Cancel

                </Button>

                <Button

                    variant="contained"

                    onClick={handleSave}

                >

                    Update

                </Button>

            </DialogActions>

        </Dialog>

    );

}