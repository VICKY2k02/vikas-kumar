import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Button
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import CustomerTable from "./CustomerTable";
import CustomerFilters from "./CustomerFilters";
import AddCustomerDialog from "./AddCustomerDialog";
import CustomerProfileDialog from "./CustomerProfileDialog";
import CustomerAnalyticsDashboard from "./CustomerAnalyticsDashboard";
import EditCustomerDialog from "./EditCustomerDialog";
import CustomerSegmentation from "./CustomerSegmentation";
import CustomerExportDialog from "./CustomerExportDialog";

import {
    getCustomers,
    getCustomer,
    getCustomerAnalytics,
    deleteCustomer,
    changeCustomerStatus,
    getCustomerSegments
} from "../../api/customerApi";

export default function CustomerDashboard() {

    const [analytics, setAnalytics] =
        useState<any>(null);

    const [segments, setSegments] =
        useState<any[]>([]);

    const [customers, setCustomers] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [openAdd, setOpenAdd] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [customerType, setCustomerType] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [city, setCity] =
        useState("");

    const [state, setState] =
        useState("");

    const [country, setCountry] =
        useState("");
    const [selectedCustomer, setSelectedCustomer] =
        useState<any>(null);

    const [profileOpen, setProfileOpen] =
        useState(false);

    const [editOpen, setEditOpen] =
        useState(false);


    const [openExport, setOpenExport] =
        useState(false);

    useEffect(() => {

        loadCustomers();

        loadAnalytics();

        loadSegments();

    }, [
        search,
        customerType,
        status,
        city,
        state,
        country
    ]);

    const loadSegments = async () => {

        try {

            const res =
                await getCustomerSegments();

            setSegments(res.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    const loadCustomers = async () => {

        setLoading(true);

        try {

            const data = await getCustomers({

                search,

                customer_type: customerType,

                status,

                city,

                state,

                country

            });

            setCustomers(data);

        }

        finally {

            setLoading(false);

        }

    };

    const loadAnalytics = async () => {

        try {

            const res =
                await getCustomerAnalytics();

            setAnalytics(res.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    


    const handleEdit = async (customer: any) => {

        try {

            const res = await getCustomer(customer.id);

            setSelectedCustomer(res.data);

            setEditOpen(true);

        } catch (err) {

            console.error(err);

        }

    };

    const handleDelete = async (customer: any) => {

        if (!window.confirm("Delete this customer?")) {
            return;
        }

        try {

            await deleteCustomer(customer.id);

            await loadCustomers();

            await loadAnalytics();

            loadCustomers();

        } catch (err) {

            console.error(err);

            alert("Failed to delete customer");

        }

    };

    const handleStatusChange = async (customer: any) => {

        try {

            const newStatus =

                customer.status === "Active"

                    ? "Inactive"

                    : "Active";

            await changeCustomerStatus(

                customer.id,

                newStatus

            );

            await loadCustomers();

            await loadAnalytics();

        }

        catch (err) {

            console.error(err);

            alert("Failed to update status");

        }

    };

    return (

        <Box p={3}>

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >

                <Typography
                    variant="h4"
                    fontWeight="bold"
                >
                    Customer Management
                </Typography>

                <Box display="flex" gap={2}>

                    <Button
                        variant="outlined"
                        onClick={() => setOpenExport(true)}
                    >
                        Export
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAdd(true)}
                    >
                        Add Customer
                    </Button>

                </Box>

            </Box>

            <CustomerFilters

                search={search}

                customerType={customerType}

                status={status}

                city={city}

                state={state}

                country={country}

                setSearch={setSearch}

                setCustomerType={setCustomerType}

                setStatus={setStatus}

                setCity={setCity}

                setState={setState}

                setCountry={setCountry}

            />

            <CustomerTable
                customers={customers}
                loading={loading}
                // onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
            />

            <CustomerAnalyticsDashboard
                analytics={analytics}
            />

            <CustomerSegmentation
                segments={segments}
            />

            <AddCustomerDialog

                open={openAdd}

                onClose={() => {

                    setOpenAdd(false);

                    loadCustomers();

                    loadAnalytics();

                }}

            />

            <CustomerProfileDialog
                open={profileOpen}
                customer={selectedCustomer}
                onClose={() => {
                    setProfileOpen(false);
                    setSelectedCustomer(null);
                }}
            />

            <CustomerExportDialog
                open={openExport}
                onClose={() => setOpenExport(false)}
            />


            <EditCustomerDialog
                open={editOpen}
                customer={selectedCustomer}
                onClose={() => {

                    setEditOpen(false);

                    setSelectedCustomer(null);

                    loadCustomers();

                    loadAnalytics();

                }}
            />

        </Box>

    );

}