const Coupon = require("../models/Coupon");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE
router.post("/", verifyToken, async(req, res, next) => {
    const newCoupon = new Coupon(req.body);

    try {
        const savedCoupon = await newCoupon.save();
        res.status(200).json(savedCoupon);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyToken, async(req, res, next) => {
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedCoupon);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyToken, async(req, res, next) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json("Coupon has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET Coupon
router.get("/find/:cId", verifyToken, async(req, res, next) => {
    try {
        const singleCoupon = await Coupon.find({ _id: req.params.cId });
        res.status(200).json(singleCoupon);
    } catch (err) {
        res.status(500).json(err);
    }
});

//CREATE
router.post("/verifycoupon", verifyToken, async(req, res, next) => {
    const coupon = await Coupon.findOne({ code: req.body.couponcode });

    try {
        if (coupon) {
            if (new Date().getTime() > coupon.startDate.getTime() && new Date().getTime() < coupon.endDate.getTime()) {
                if (req.body.total >= coupon.thresholdAmount) {
                    let discount;
                    if (coupon.type === 'percentage') {
                        discount = (req.body.total * coupon.value) / 100
                    } else {
                        discount = coupon.value
                    }

                    res.status(200).json({
                        inRange: true,
                        discount,
                        finalAmount: req.body.total - discount
                    })
                } else {
                    res.status(200).json({
                        inRange: false,
                        message: `Need to add more items worth ${coupon.thresholdAmount - req.body.total} to the list for this coupon to be enabled.`
                    })
                }


            } else {
                res.status(200).json({
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
        res.status(500).json(err);
    }
});

// COUPONS SEARCH
router.get("/search/:key", verifyToken, async(req, res) => {
    try {


        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };


        coupons = await Coupon.paginate({
            "$or": [
                { code: { $regex: req.params.key } },
                { type: { $regex: req.params.key } },
            ]
        }, options);
        res.status(200).json(coupons);

    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL
router.get("/", verifyToken, async(req, res, next) => {
    try {
        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };

        //const orders = await Order.find();
        allCoupon = await Coupon.paginate({}, options);
        res.status(200).json(allCoupon);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;