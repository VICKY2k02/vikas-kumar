import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack
} from "@mui/material";

import {
    exportCustomerList,
    exportCustomerAnalyticsCSV,
    exportCustomerAnalyticsPDF,
    exportTopCustomersCSV,
    exportTopCustomersPDF
} from "../../api/customerExportApi";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CustomerExportDialog({
    open,
    onClose
}: Props) {

    const downloadFile = (
        blob: Blob,
        fileName: string
    ) => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = fileName;

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(url);

    };

    const handleExport = async (
        type: string
    ) => {

        try {

            let response;

            switch (type) {

                case "customer-list":

                    response =
                        await exportCustomerList();

                    downloadFile(
                        response.data,
                        "Customer_List.csv"
                    );

                    break;

                case "analytics-csv":

                    response =
                        await exportCustomerAnalyticsCSV();

                    downloadFile(
                        response.data,
                        "Customer_Analytics.csv"
                    );

                    break;

                case "analytics-pdf":

                    response =
                        await exportCustomerAnalyticsPDF();

                    downloadFile(
                        response.data,
                        "Customer_Analytics.pdf"
                    );

                    break;

                case "top-csv":

                    response =
                        await exportTopCustomersCSV();

                    downloadFile(
                        response.data,
                        "Top_Customers.csv"
                    );

                    break;

                case "top-pdf":

                    response =
                        await exportTopCustomersPDF();

                    downloadFile(
                        response.data,
                        "Top_Customers.pdf"
                    );

                    break;

            }

        } catch (err) {

            console.error(err);

            alert("Export failed");

        }

    };

    return (

        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >

            <DialogTitle>

                Export Customer Reports

            </DialogTitle>

            <DialogContent>

                <Stack spacing={2} mt={1}>

                    <Button
                        variant="contained"
                        onClick={() =>
                            handleExport("customer-list")
                        }
                    >
                        Customer List (CSV)
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            handleExport("analytics-csv")
                        }
                    >
                        Customer Analytics (CSV)
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            handleExport("analytics-pdf")
                        }
                    >
                        Customer Analytics (PDF)
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            handleExport("top-csv")
                        }
                    >
                        Top Customers (CSV)
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            handleExport("top-pdf")
                        }
                    >
                        Top Customers (PDF)
                    </Button>

                </Stack>

            </DialogContent>

            <DialogActions>

                <Button
                    onClick={onClose}
                >
                    Close
                </Button>

            </DialogActions>

        </Dialog>

    );

}