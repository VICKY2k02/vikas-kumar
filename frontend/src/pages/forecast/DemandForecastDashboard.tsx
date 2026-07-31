// import { useEffect, useState } from "react";
// import { Box, Typography } from "@mui/material";

// import ForecastKPICards from "./ForecastKPICards";
// import ForecastFilters from "./ForecastFilters";
// import ForecastProductTable from "./ForecastTable";
// import ForecastCategoryTable from "./ForecastCategoryTable";

// import {
//     getForecastDashboard,
//     getForecastProducts,
//     getForecastCategories,
//     getDashboard,
//     getProductForecasts,
//     getCategoryForecasts,
//     generateForecast
// } from "../../api/forecastApi";

// export default function DemandForecastDashboard() {

//     const [dashboard, setDashboard] = useState<any>(null);

// const [products, setProducts] = useState<any[]>([]);

// const [categories, setCategories] = useState<any[]>([]);

// const [period, setPeriod] = useState(30);

// const [loading, setLoading] = useState(false);

//     const [filters, setFilters] = useState({

//         product: "",

//         category: "",

//         brand: "",

//         period: "30"

//     });

//     useEffect(() => {

//         loadDashboard();

//     }, [filters]);

//     const loadDashboard = async () => {

//         try {

//             const dashboardRes =
//                 await getForecastDashboard(filters);

//             setDashboard(dashboardRes.data);

//             const productRes =
//                 await getForecastProducts(filters);

//             setProducts(productRes.data);

//             const categoryRes =
//                 await getForecastCategories(filters);

//             setCategories(categoryRes.data);

//         }

//         catch (err) {

//             console.log(err);

//         }

//     };


//     const loadForecastData = async () => {

//     setLoading(true);

//     try {

//         const dashboardRes = await getDashboard();

//         const productRes = await getProductForecasts();

//         const categoryRes = await getCategoryForecasts();

//         setDashboard(dashboardRes.data);

//         setProducts(productRes.data);

//         setCategories(categoryRes.data);

//     } catch (err) {

//         console.log(err);

//     }

//     setLoading(false);

// };

// useEffect(() => {

//     loadForecastData();

// }, []);


// const handleGenerate = async () => {

//     try {

//         await generateForecast(period);

//         await loadForecastData();

//         alert("Forecast Generated");

//     }

//     catch (err) {

//         console.log(err);

//     }

// };


//     return (

//         <Box p={3}>

//             <Typography
//                 variant="h4"
//                 fontWeight="bold"
//                 mb={3}
//             >

//                 Demand Forecasting

//             </Typography>

//             <ForecastFilters

//                 filters={filters}

//                 setFilters={setFilters}

//             />

//             <ForecastFilters

//     period={period}

//     setPeriod={setPeriod}

//     onGenerate={handleGenerate}

// />

//             <ForecastKPICards

//                 dashboard={dashboard}

//             />

//             <ForecastProductTable

//                 data={products}

//             />

//             <ForecastCategoryTable

//                 data={categories}

//             />

//         </Box>

//     );

// }