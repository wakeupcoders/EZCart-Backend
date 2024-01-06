const router = require("express").Router();
const CustomErrorHandler = require("../services/CustomErrorHandler");
let razorpayInstance = require('../helpers/razorpay');
const crypto = require('crypto');
const sendMail = require("../services/EmailService");


//Create Order in CoinGate
router.post("/", async(req, res,next) => {
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

router.post("/verify", async(req, res,next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", "NxHRojWVvhgA6bPQDws247jD").update(body.toString()).digest("hex");
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Database comes here
            // await Payment.create({razorpay_order_id,razorpay_payment_id,razorpay_signature,});
            // res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
            sendMail({
                from: "cgqspider@gmail.com",
                to: req.body.email,
                subject: "Order Confirmation",
                text: `Your order is received. Thanks for Shopping with us.`,
                html: require("../templates/orderConfirmationEmailTemplate")({
                    emailFrom: req.body.email,
                    //name: req.body.name,
                    trackLink: "google.com",
                    // size: ' KB',
                    // expires: "5 Minutes",
                }),
            })
            .then(() => {
                return res.status(200).json({success: true,});
                //return res.json({ message: "Order Confirmation Email Sent!!" });
                //return res.json({success: true});
            })
            .catch((err) => {
                return res.status(500).json({ message: err });
            });
           
          } 
          else 
          {
            res.status(400).json({success: false,});
          }
    } catch (err) {
        next(err)
    }
});

module.exports = router;