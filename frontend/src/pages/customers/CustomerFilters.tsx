import {
    Box,
    TextField,
    MenuItem,
    Button
} from "@mui/material";

interface Props {

    search: string;

    customerType: string;

    status: string;

    city: string;

    state: string;

    country: string;

    setSearch: (value: string) => void;

    setCustomerType: (value: string) => void;

    setStatus: (value: string) => void;

    setCity: (value: string) => void;

    setState: (value: string) => void;

    setCountry: (value: string) => void;

}

export default function CustomerFilters({

    search,

    customerType,

    status,

    city,

    state,

    // country,

    setSearch,

    setCustomerType,

    setStatus,

    setCity,

    setState,

    setCountry

}: Props) {

    return (

        <Box

            display="flex"

            gap={2}

            flexWrap="wrap"

            mb={3}

        >

            <TextField

                label="Search"

                value={search}

                onChange={(e) =>

                    setSearch(

                        e.target.value

                    )

                }

                sx={{ minWidth: 220 }}

            />

            <TextField

                select

                label="Customer Type"

                value={customerType}

                onChange={(e) =>

                    setCustomerType(

                        e.target.value

                    )

                }

                sx={{ minWidth: 170 }}

            >

                <MenuItem value="">

                    All

                </MenuItem>

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

                label="Status"

                value={status}

                onChange={(e) =>

                    setStatus(

                        e.target.value

                    )

                }

                sx={{ minWidth: 150 }}

            >

                <MenuItem value="">

                    All

                </MenuItem>

                <MenuItem value="Active">

                    Active

                </MenuItem>

                <MenuItem value="Inactive">

                    Inactive

                </MenuItem>

            </TextField>

            <TextField

                label="City"

                value={city}

                onChange={(e) =>

                    setCity(

                        e.target.value

                    )

                }

            />

            <TextField

                label="State"

                value={state}

                onChange={(e) =>

                    setState(

                        e.target.value

                    )

                }

            />

            {/* <TextField

                label="Country"

                value={country}

                onChange={(e) =>

                    setCountry(

                        e.target.value

                    )

                }

            /> */}

            <Button

                variant="outlined"

                onClick={() => {

                    setSearch("");

                    setCustomerType("");

                    setStatus("");

                    setCity("");

                    setState("");

                    setCountry("");

                }}

            >

                Clear Filters

            </Button>

        </Box>

    );

}