const Order = require("../models/Order");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");

const { isValidObjectId } = require("mongoose");

const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");
const webpush = require("web-push");

const router = require("express").Router();


// GET MONTHLY INCOME
router.get("/monthly/income", verifyTokenAndAdmin, async(req, res) => {
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

// GET MONTHLY dashboard: 
router.get("/monthly", verifyTokenAndAdmin, async(req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    console.log(previousMonth)
    console.log(lastMonth)

    try {
        const cartCount = await Cart.aggregate([
            {
              $match: {
                createdAt: {
                  $gte:lastMonth,
                  $lt: previousMonth
                }
              }
            },
            {
              $group: {
                _id: null,
                totalCarts: { $sum: 1 }
              }
            }
          ]);

        const wishlistCount = await Wishlist.aggregate([
            {
              $match: {
                createdAt: {
                  $gte:lastMonth,
                  $lt: previousMonth
                }
              }
            },
            {
              $group: {
                _id: null,
                totalWishlist: { $sum: 1 }
              }
            }
        ]);

        const customerCount = await User.aggregate([
            {
              $match: {
                createdAt: {
                  $gte:lastMonth,
                  $lt: previousMonth
                }
              }
            },
            {
              $group: {
                _id: null,
                totalCustomer: { $sum: 1 }
              }
            }
        ]);

        const orderSum = await Order.aggregate([
            {
              $match: {
                createdAt: {
                  $gte:lastMonth,
                  $lt: previousMonth
                }
              }
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount' }
              }
            }
        ]);

        return res.status(200).json({"dashboard":{"cartCount":cartCount[0].totalCarts, "wishlistCount":wishlistCount[0].totalWishlist, "customerCount":customerCount[0].totalCustomer, "orderSum":orderSum[0].totalAmount}});

    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;