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

// GET MONTHLY dashboard: 
router.get("/monthly", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  totalCarts = 0;
  totalWishlist = 0;
  totalCustomer = 0;
  totalAmount = 0;
  totalOrderCancelled=0;
  totalOrderPlaced=0;
  totalOrderShipped=0;
  totalOrderConfirmed=0;



  try {
    const cartCount = await Cart.aggregate([
      {
        $match: {
          createdAt: {
            $gte: lastMonth,
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
    if (cartCount.length > 0) {
      totalCarts=cartCount[0].totalCarts;
    }

    const wishlistCount = await Wishlist.aggregate([
      {
        $match: {
          createdAt: {
            $gte: lastMonth,
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
    
    if (wishlistCount.length > 0) {
      totalWishlist=wishlistCount[0].totalWishlist;
    }

    const customerCount = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: lastMonth,
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

    if (customerCount.length > 0) {
      totalCustomer=customerCount[0].totalCustomer;
    }

    const orderSum = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: lastMonth,
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

    if (orderSum.length > 0) {
      totalAmount=orderSum[0].totalAmount;
    }


    const orderPlaced = await Order.aggregate([
      {
        $match: {
          status: 'placed',
          createdAt: {
            $gte: lastMonth,
            $lt: previousMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    if (orderPlaced.length > 0) {
      totalOrderPlaced=orderPlaced[0].totalOrders;
    }


    const orderShipped = await Order.aggregate([
      {
        $match: {
          status: 'shipped',
          createdAt: {
            $gte: lastMonth,
            $lt: previousMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    if (orderShipped.length > 0) {
      totalOrderShipped=orderShipped[0].totalOrders;
    }

    const orderConfirmed = await Order.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: {
            $gte: lastMonth,
            $lt: previousMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    if (orderConfirmed.length > 0) {
      totalOrderConfirmed=orderConfirmed[0].totalOrders;
    }


    const orderCancelled = await Order.aggregate([
      {
        $match: {
          status: 'cancelled',
          createdAt: {
            $gte: lastMonth,
            $lt: previousMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    if (orderCancelled.length > 0) {
      totalOrderCancelled=orderCancelled[0].totalOrders;
    }

    return res.status(200).json({ "dashboard": { "cartCount": totalCarts, "wishlistCount": totalWishlist, "customerCount": totalCustomer, "orderSum": totalAmount, "orderPlacedCount": totalOrderPlaced, "orderShippedCount": totalOrderShipped, "orderConfirmedCount": totalOrderConfirmed, "orderCancelledCount": totalOrderCancelled  } });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;