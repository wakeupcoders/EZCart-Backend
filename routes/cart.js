const Cart = require("../models/Cart");
const User = require("../models/User");
const { isValidObjectId } = require("mongoose");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// Create or Update Cart
router.post("/", verifyToken, async(req, res, next) => {
    try {
        const userId = req.body.userId;
        let user = await User.findOne({ _id: userId });

        if (!userId || !isValidObjectId(userId) || !user) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid user ID" });
        }

        let productId = req.body.productId;
        if (!productId) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid product" });
        }

        let cart = await Cart.findOne({ userId: userId });

        if (cart) {
            let itemIndex = cart.products.findIndex((p) => p.productId == productId);

            if (itemIndex > -1) {
                let productItem = cart.products[itemIndex];
                productItem.quantity += 1;
                cart.products[itemIndex] = productItem;
            } else {
                cart.products.push({ productId: productId, quantity: 1 });
            }
            cart = await cart.save();
            return res.status(200).send({ status: true, updatedCart: cart });
        } else {
            const newCart = await Cart.create({
                userId,
                products: [{ productId: productId, quantity: 1 }],
            });

            return res.status(201).send({ status: true, newCart: newCart });
        }
    } catch (err) {
        next(err);
    }
});

// Decrease quanity of cart
router.post("/decrease", verifyToken, async(req, res, next) => {
    try {
        let userId = req.body.userId;
        let user = await User.exists({ _id: userId });

        if (!userId || !isValidObjectId(userId) || !user) {
            return res.status(400).json({ status: false, message: "Invalid user ID" });
        }

        let productId = req.body.productId;
        if (!productId) {
            return res.status(400).json({ status: false, message: "Invalid product" });
        }

        let cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(200).json({ status: false, message: "Cart not found for this user", cart: [], });
        }


        let itemIndex = cart.products.findIndex((p) => p.productId == productId);

        if (itemIndex > -1) {
            let productItem = cart.products[itemIndex];
            if (productItem.quantity === 1) {
                cart.products.splice(itemIndex, 1);
                cart = await cart.save();
                return res.status(200).send({ status: true, updatedCart: cart });
            }
            productItem.quantity -= 1;
            cart.products[itemIndex] = productItem;
            cart = await cart.save();
            return res.status(200).send({ status: true, updatedCart: cart });
        }
        return res.status(400).json({ status: false, message: "Item does not exist in cart" });
    } catch (err) {
        next(err);
    }
});

//Get the Cart of User
router.get("/find/:userId", verifyToken, async(req, res, next) => {
    try {
        let userId = req.params.userId;
        let user = await User.exists({ _id: userId });

        if (!userId || !isValidObjectId(userId) || !user) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid user ID" });
        }

        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res
                .status(200)
                .send({
                    status: false,
                    message: "Cart not found for this user",
                    cart: [],
                });
        }

        return res.status(200).send({ status: true, cart: cart });
    } catch (err) {
        next(err);
    }
});

// Delete the Cart of User
router.delete("/:id", verifyToken, async(req, res, next) => {
    try {
        let userId = req.params.id;
        let user = await User.exists({ _id: userId });
        let productId = req.body.productId;

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
        }

        let itemIndex = cart.products.findIndex((p) => p.productId == productId);
        if (itemIndex > -1) {
            cart.products.splice(itemIndex, 1);
            cart = await cart.save();
            return res.status(200).send({ status: true, updatedCart: cart });
        }
        return res
            .status(400)
            .send({ status: false, message: "Item does not exist in cart" });
    } catch (err) {
        next(err);
    }
});

// //GET ALL

router.get("/", verifyToken, async(req, res) => {
    try {
        const carts = await Cart.find();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;