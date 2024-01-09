const router = require("express").Router();
const CustomErrorHandler = require("../services/CustomErrorHandler");
let razorpayInstance = require('../helpers/razorpay');
const crypto = require('crypto');
const sendMail = require("../services/EmailService");
const RazorpayPayment = require("../models/Razorpaypayments");
const User = require("../models/User");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");


//Create Order in CoinGate
router.post("/",verifyToken, async(req, res,next) => {
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
                
                res.status(200).json(order)
            }
        });
    } catch (err) {
        next(err)
    }
});

router.get("/", verifyToken, async(req, res, next) => {
    const { page, perpage } = req.query;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(perpage, 10),
    };
    try {
        let payments;
        payments = await RazorpayPayment.paginate({}, options);
        res.status(200).json(payments);
    } 
    catch (err) {
        res.status(500).json(err);
    }
});

//GET USER PAYMENTS
router.get("/find/:userId", verifyToken, async(req, res, next) => {
    try {
        const singlePayment = await RazorpayPayment.find({ userId: req.params.userId });
        res.status(200).json(singlePayment);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/verify", verifyToken,async(req, res,next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", "NxHRojWVvhgA6bPQDws247jD").update(body.toString()).digest("hex");
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {

            await RazorpayPayment(req.body).save();
            // Database comes here
            // await Payment.create({razorpay_order_id,razorpay_payment_id,razorpay_signature,});
            // res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
            await Cart.findOneAndRemove({ userId: req.body.userid });

            const user=await User.findById(req.body.userid);

            const updatedOrder = await Order.findByIdAndUpdate(
                req.body.ezcart_order_id, {
                    $set: { status: "placed" },
                }, { new: true }
            );

            sendMail({
                from: "cgqspider@gmail.com",
                to:  user["email"],
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
                return res.status(200).json({success: true,order:updatedOrder, user:user});
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

router.delete("/:id", verifyToken, async(req, res, next) => {
    try {

        if (req.params.id === "clean") {
            await RazorpayPayment.remove();
            msg = "All Payments has been Cleaned";
        } else {
            await RazorpayPayment.findByIdAndDelete(req.params.id);
            msg = "Payment has been deleted...";
        }

       
        res.status(200).json({"message":msg});
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyToken, async(req, res, next) => {
    try {
        const updatedPayment = await RazorpayPayment.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedPayment);
    } catch (err) {
        res.status(500).json(err);
    }
});



module.exports = router;