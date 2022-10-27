const router = require("express").Router();
const CustomErrorHandler = require("../services/CustomErrorHandler");
var { APP_URL } = require("../config/index");
const axios = require('axios');




//login to shiprocket
router.post("/login", async(req, res, next) => {

    this.axiosAuthInstance = axios.create({
        baseURL: process.env.SHIPROCKET_URL,
    });

    try {
        const result = await this.axiosAuthInstance.post('/auth/login', {
            email: process.env.SHIPROCKET_USER,
            password: process.env.SHIPROCKET_PASSWORD,
        });

        if (result.status !== 200) throw { message: 'Unable to get auth-token!' };

        return res.status(200).json({ status: true, message: 'Auth token fetched!', data: result.data });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Create Order to Shiprocket
router.post("/create", async(req, res, next) => {
    this.axiosInstance = axios.create({
        baseURL: process.env.SHIPROCKET_URL,
        headers: {
            'Authorization': `Bearer ${req.body.token}`,
        },
    });

    try {
        const {
            order_id,
            order_date,
            pickup_location,
            channel_id,
            comment,
            billing_customer_name,
            billing_last_name,
            billing_address,
            billing_address_2,
            billing_city,
            billing_pincode,
            billing_state,
            billing_country,
            billing_email,
            billing_phone,
            shipping_is_billing,
            order_items,
            payment_method,
            shipping_charges,
            giftwrap_charges,
            transaction_charges,
            total_discount,
            sub_total,
            length,
            breadth,
            height,
            weight,
        } = req.body;

        const result = await this.axiosInstance.post('orders/create/adhoc', {
            order_id,
            order_date,
            pickup_location,
            channel_id,
            comment,
            billing_customer_name,
            billing_last_name,
            billing_address,
            billing_address_2,
            billing_city,
            billing_pincode,
            billing_state,
            billing_country,
            billing_email,
            billing_phone,
            shipping_is_billing,
            order_items,
            payment_method,
            shipping_charges,
            giftwrap_charges,
            transaction_charges,
            total_discount,
            sub_total,
            length,
            breadth,
            height,
            weight,
        });

        let status = false;

        // if (!status) throw { message: data.message };

        res.status(200).json({ status: true, message: result.data });

    } catch (error) {

        // const message = this.parseError(error);
        console.log(error.message)

        res.status(500).json({ status: false, data: null, error });
    }

});






module.exports = router;