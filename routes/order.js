const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const sendMail = require("../services/EmailService");

const { isValidObjectId } = require("mongoose");

const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");
const webpush = require("web-push");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res, next) => {
    try {
        let userId = req.body.userId;
        let productIds = [];

        let user = await User.exists({ _id: userId });

        if (!userId || !isValidObjectId(userId) || !user) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid user ID" });
        }

        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res
                .status(404)
                .send({ status: false, message: "Cart not found for this user" });
        } else {
            //Get all the IDS of products which are available for cart.
            cart.products.forEach((element) => {
                productIds.push(element["productId"]);
            });

            //Fetch products by using product ids.
            const productsByIds = await Product.find({ _id: { $in: productIds } });

            //Mapping the Quantity to the products
            let result = await productsByIds.map((x) => {
                let itemData = cart.products.find(
                    (item) => item.productId === x._id.toString()
                );
                if (itemData) {
                    x._doc.quantity = itemData.quantity;
                    return x;
                }
            });

            //Find the Total of Products
            let totalPrice = result.reduce(function (accumulator, item) {
                return accumulator + item._doc.quantity * item._doc.price;
            }, 0);


            //Check the Coupon 
            const coupon = await Coupon.findOne({ code: req.body.couponcode });
            let discount;
            try {
                if (coupon) {
                    if (new Date().getTime() > coupon.startDate.getTime() && new Date().getTime() < coupon.endDate.getTime()) {
                        if (totalPrice >= coupon.thresholdAmount) {
                            
                            if (coupon.type === 'Percentage') {
                                discount = (totalPrice * coupon.value) / 100
                            } else {
                                discount = coupon.value
                            }

                          totalPrice=totalPrice-discount;
                        } else {
                            return res.status(200).json({
                                inRange: false,
                                message: `Need to add more items worth ${coupon.thresholdAmount - totalPrice} to the list for this coupon to be enabled.`
                            })
                        }


                    } else {
                        return res.status(200).json({
                            inRange: false,
                            message: 'Coupon expired! Try another coupon.'
                        })
                    }


                } else {
                    res.status(200).json({
                        inRange: false,
                        message: 'Coupon invalid!please use a valid Coupon.'
                    })
                }
            } catch (err) {
                console.log(err)
                res.status(500).json(err);
            }


            // Create a Order creation onject
            if (totalPrice && totalPrice > 0) {
                let orderDetails = {
                    userId: userId,
                    products: cart.products,
                    receiverName: req.body.receiverName,
                    amount: totalPrice,
                    discount: discount,
                    couponcode: req.body.couponcode,
                    email: req.body.email,
                    phone: req.body.phone,
                    pmode: req.body.pmode,
                    address: req.body.address,
                    status: req.body.status
                };

                const newOrder = new Order(orderDetails);
                const savedOrder = await newOrder.save();



                if (req.body.pmode === "COD") {
                    //Deleting Cart of User
                    await Cart.findOneAndRemove({ userId: userId });
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
                            //return res.json({ message: "Order Confirmation Email Sent!!" });
                            //return res.json({success: true});
                        })
                        .catch((err) => {
                            //return res.status(500).json({ message: err });
                        });

                }

                const io = req.app.get("socketio");
                io.emit("notification", req.body);
                return res.status(200).json(savedOrder);
            }

        }
    } catch (err) {
        next(err);
    }
});


//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, {
            $set: req.body,
        }, { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        let msg = "";
        if (req.params.id === "clean") {
            await Order.remove();
            msg = "All orders has been Cleaned";
        } else {
            await Order.findByIdAndDelete(req.params.id);
            msg = "Order has been deleted...";
        }
        res.status(200).json(msg);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

//GET PRODUCT
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER ORDERS
router.get("/find/:userId", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ _id: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER ORDERS
router.get("/search/:key", verifyToken, async (req, res) => {
    try {
        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };

        //const orders = await Order.find();
        orders = await Order.paginate({
            $or: [
                { userId: { $regex: req.params.key } },
                { pmode: { $regex: req.params.key } },
                { phone: { $regex: req.params.key } },
                { email: { $regex: req.params.key } },
                { address: { $regex: req.params.key } },
                { status: { $regex: req.params.key } },
            ],
        },
            options
        );
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Update order status
router.put("/orderstatus/:orderId", verifyToken, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId, {
            $set: { status: req.body.status },
        }, { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

// //GET ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };

        //const orders = await Order.find();
        orders = await Order.paginate({}, options);
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET MONTHLY INCOME
router.get("/monthly/income", verifyTokenAndAdmin, async (req, res) => {
    const productId = req.query.pid;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await Order.aggregate([{
            $match: {
                createdAt: { $gte: previousMonth },
                ...(productId && {
                    products: { $elemMatch: { productId } },
                }),
            },
        },
        {
            $project: {
                month: { $month: "$createdAt" },
                sales: "$amount",
            },
        },
        {
            $group: {
                _id: "$month",
                total: { $sum: "$sales" },
            },
        },
        ]);
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;