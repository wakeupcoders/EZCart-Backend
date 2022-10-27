const router = require("express").Router();
const CustomErrorHandler = require("../services/CustomErrorHandler");
const axios = require("axios");
const { config } = require("dotenv");

//Create Order in CoinGate

router.post("/", async(req, res, next) => {
    try {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Token ${process.env.COINGATE_TOKEN}`,
        };

        const orderObject = {
            title: "IPHONE 14",
            price_amount: 20,
            price_currency: "USD",
            receive_currency: "USD",
            callback_url: "https://webhook.site/06884a71-03d2-4112-88a4-2ef72c7bfe78",
            success_url: "https://webhook.site/06884a71-03d2-4112-88a4-2ef72c7bfe78",
            cancel_url: "https://webhook.site/06884a71-03d2-4112-88a4-2ef72c7bfe78",
            order_id: "11163405e5b3b16935264d1991a",
            description: "Iphone 14",
        };

        axios
            .post(`${process.env.COINGATE_URL}`, orderObject, {
                headers: headers,
            })
            .then((response) => {
                console.log(response)
                return res.status(200).json({
                    status: true,
                    message: "Coingate Order created successfully!!!",
                    data: response.data,
                });
            })
            .catch((error) => {
                next(error)
            });


    } catch (err) {
        next(err);
    }
});

module.exports = router;