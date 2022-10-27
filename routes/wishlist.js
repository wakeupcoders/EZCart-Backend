const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const User = require("../models/User");
const { isValidObjectId } = require("mongoose");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// Create or Update Wishlist
router.post("/", verifyToken, async(req, res, next) => {
    try {
        const userId = req.body.userId;
        let user = await User.findOne({ _id: userId });

        if (!userId || !isValidObjectId(userId) || !user) {
            return res.status(400).send({ status: false, message: "Invalid user ID" });
        }

        let productId = req.body.productId;
        if (!productId) {
            return res.status(400).send({ status: false, message: "Invalid product" });
        }

        let wishlist = await Wishlist.findOne({ userId: userId });

        if (wishlist) {
            let itemIndex = wishlist.products.findIndex((p) => p.productId == productId);

            if (itemIndex > -1) {
                return res.status(403).send({ status: false, message: "This product already in wishlist" });
            } else {
                wishlist.products.push({ productId: productId, quantity: 1 });
            }


            wishlist = await wishlist.save();
            return res.status(200).send({ status: true, updatedWishlist: wishlist });

        } else {
            const newWishlist = await Wishlist.create({
                userId,
                products: [{ productId: productId, quantity: 1 }],
            });

            return res.status(201).send({ status: true, newCart: newWishlist });
        }
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

        let wishlist = await Wishlist.findOne({ userId: userId });
        if (!wishlist) {
            return res
                .status(200)
                .send({ status: false, message: "Wishlist not found for this user", wishlist: [] });
        }


        let productIds = [];

        //Get all the IDS of products which are available for wishlist.
        wishlist.products.forEach((element) => {
            productIds.push(element["productId"]);
        });

        //Fetch products by using product ids.
        const productsByIds = await Product.find({ _id: { $in: productIds } });

        return res.status(200).send({ status: true, wishlist: productsByIds });
    } catch (err) {
        next(err);
    }
});

// Delete the Cart of User
router.delete("/:id", verifyToken, async(req, res, next) => {
    try {

        if (req.params.id === "clean") {
            await Wishlist.remove();
            return res.status(202).send({ status: false, message: "All Wishlists cleaned successfully" });
        }

        let userId = req.params.id;
        let user = await User.exists({ _id: userId });
        let productId = req.body.productId;

        if (!userId || !isValidObjectId(userId) || !user) {
            return res.status(400).send({ status: false, message: "Invalid user ID" });
        }


        let wishlist = await Wishlist.findOne({ userId: userId });
        if (!wishlist) {
            return res.status(404).send({ status: false, message: "wishlist not found for this user" });
        }

        let itemIndex = wishlist.products.findIndex((p) => p.productId == productId);
        if (itemIndex > -1) {
            wishlist.products.splice(itemIndex, 1);
            wishlist = await wishlist.save();
            return res.status(200).send({ status: true, updatedWishlist: wishlist });
        }
        return res.status(400).send({ status: false, message: "Item does not exist in cart" });

    } catch (err) {
        next(err);
    }
});

// //GET ALL
router.get("/", verifyToken, async(req, res) => {
    try {
        const carts = await Wishlist.find();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;