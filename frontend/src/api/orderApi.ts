import axios from "axios";

const API = "http://127.0.0.1:8000/orders";

const getHeaders = () => {

    const token = localStorage.getItem("access_token");

    return {

        headers: {

            Authorization: `Bearer ${token}`

        }

    };

};


// -------------------------------------
// Get All Orders
// -------------------------------------
export const getOrders = async () => {

    const res = await axios.get(

        API,

        getHeaders()

    );

    return res.data;

};


// -------------------------------------
// Get Single Order
// -------------------------------------
export const getOrder = async (

    id: number

) => {

    const res = await axios.get(

        `${API}/${id}`,

        getHeaders()

    );

    return res.data;

};


// -------------------------------------
// Create Order
// -------------------------------------
export const createOrder = async (

    data: any

) => {

    const res = await axios.post(

        API,

        data,

        getHeaders()

    );

    return res.data;

};


// -------------------------------------
// Update Order
// -------------------------------------
export const updateOrder = async (

    id: number,

    data: any

) => {

    const res = await axios.put(

        `${API}/${id}`,

        data,

        getHeaders()

    );

    return res.data;

};


// -------------------------------------
// Delete Order
// -------------------------------------
export const deleteOrder = async (

    id: number

) => {

    const res = await axios.delete(

        `${API}/${id}`,

        getHeaders()

    );

    return res.data;

};