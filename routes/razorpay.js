const router = require("express").Router();
const CustomErrorHandler = require("../services/CustomErrorHandler");
let razorpayInstance = require('../helpers/razorpay');

//Create Order in CoinGate

router.post("/", async(req, res) => {
    var options = {
        amount: req.body.amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: req.body.email,
        payment_capture: '0'
    };
    try {
        razorpayInstance.instance.orders.create(options, async function(razor_error, order) {
            if (razor_error) {
                console.log("razor error ", razor_error)
                res.status(417).json({
                    message: razor_error.message,
                    payload: null,
                    error: "razor pay order creation unsuccessful"
                });
            } else {
                // const orderData = req.body;
                console.log(order)
                    // orderData["orderId"] = order.id;
                    // const newOrder = new Order(orderData);
                    // const savedOrder = await newOrder.save();

                // console.log(order);
                res.status(200).json(order)

            }
        });
    } catch (err) {
        next(err)
    }
});

module.exports = router;