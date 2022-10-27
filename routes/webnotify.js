const webnotify = require("../models/Webnotify");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// Create Web Notify
router.post("/", async(req, res, next) => {
    const newWebNotify = new webnotify(req.body);
    try {
        const savedWebnotify = await newWebNotify.save();
        res.status(200).json(savedWebnotify);
    } catch (err) {
        return next(err);
    }
});

// Delete Web Notify
router.delete("/:id", async(req, res, next) => {
    try {
        let msg = "";
        if (req.params.id === "clean") {
            await webnotify.remove();
            msg = "All Notify has been Cleaned";
        } else {
            await webnotify.findByIdAndDelete(req.params.id);
            msg = "Notify has been deleted";
        }
        res.status(200).json(msg);
    } catch (err) {
        return next(err);

    }
});

// Get All Notify
router.get("/", async(req, res, next) => {
    try {
        const Allwebnotify = await webnotify.find();
        res.status(200).json(Allwebnotify);
    } catch (err) {
        next(err);
    }
});



module.exports = router;