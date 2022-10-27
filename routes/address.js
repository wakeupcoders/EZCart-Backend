const Address = require("../models/Address");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();


//CREATE
router.post("/", verifyToken, async(req, res, next) => {
    const newAddress = new Address(req.body);

    try {
        const savedAddress = await newAddress.save();
        res.status(200).json(savedAddress);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyToken, async(req, res, next) => {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedAddress);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyToken, async(req, res, next) => {
    try {
        await Address.findByIdAndDelete(req.params.id);
        res.status(200).json("Address has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER Address
router.get("/find/:userId", verifyToken, async(req, res, next) => {
    try {
        const singleAddress = await Address.find({ userId: req.params.userId });
        res.status(200).json(singleAddress);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL
router.get("/", verifyToken, async(req, res, next) => {
    try {
        const allAddress = await Address.find();
        res.status(200).json(allAddress);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;