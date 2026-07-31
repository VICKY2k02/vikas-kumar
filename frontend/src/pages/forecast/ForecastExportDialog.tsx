import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack
} from "@mui/material";

import { useState } from "react";

import {
    exportForecastReport
} from "../../api/forecastApi";

interface Props{

    open:boolean;

    onClose:()=>void;

}

export default function ForecastExportDialog({

    open,

    onClose

}:Props){

    const [report,setReport]=useState("forecast");

    const [format,setFormat]=useState("csv");

    const handleExport=async()=>{

        try{

            await exportForecastReport(

                report,

                format

            );

            onClose();

        }

        catch(err){

            console.log(err);

        }

    };

    return(

        <Dialog

            open={open}

            onClose={onClose}

            maxWidth="sm"

            fullWidth

        >

            <DialogTitle>

                Export Forecast Report

            </DialogTitle>

            <DialogContent>

                <Stack spacing={3} mt={1}>

                    <FormControl fullWidth>

                        <InputLabel>

                            Report

                        </InputLabel>

                        <Select

                            value={report}

                            label="Report"

                            onChange={(e)=>

                                setReport(

                                    e.target.value

                                )

                            }

                        >

                            <MenuItem value="forecast">

                                Demand Forecast Report

                            </MenuItem>

                            <MenuItem value="product">

                                Product Forecast Report

                            </MenuItem>

                            <MenuItem value="category">

                                Category Forecast Report

                            </MenuItem>

                        </Select>

                    </FormControl>

                    <FormControl fullWidth>

                        <InputLabel>

                            Format

                        </InputLabel>

                        <Select

                            value={format}

                            label="Format"

                            onChange={(e)=>

                                setFormat(

                                    e.target.value

                                )

                            }

                        >

                            <MenuItem value="csv">

                                CSV

                            </MenuItem>

                            <MenuItem value="pdf">

                                PDF

                            </MenuItem>

                        </Select>

                    </FormControl>

                </Stack>

            </DialogContent>

            <DialogActions>

                <Button

                    onClick={onClose}

                >

                    Cancel

                </Button>

                <Button

                    variant="contained"

                    onClick={handleExport}

                >

                    Export

                </Button>

            </DialogActions>

        </Dialog>

    );

}