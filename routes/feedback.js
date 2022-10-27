const feedback = require("../models/Feedback");
var Sentiment = require("sentiment");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// Create Feedback
router.post("/", verifyToken, async(req, res, next) => {
    var sentiment = new Sentiment();
    const newFeedback = new feedback(req.body);

    try {
        newFeedback.reviewSentiments = sentiment.analyze(req.body.review);
        const savedFeedback = await newFeedback.save();
        res.status(200).json(savedFeedback);
    } catch (err) {
        return next(err);
    }
});

// Update Feedback
router.put("/:id", verifyToken, async(req, res, next) => {
    try {
        const updatedFeedback = await feedback.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedFeedback);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Feedback
router.delete("/:id", verifyToken, async(req, res, next) => {
    try {
        let msg = "";
        if (req.params.id === "clean") {
            await feedback.remove();
            msg = "All Feedback has been Cleaned";
        } else {
            await feedback.findByIdAndDelete(req.params.id);
            msg = "Feedback has been deleted";
        }
        res.status(200).json(msg);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Find Feedback
router.get("/find/:productId", async(req, res, next) => {
    try {
        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };

        feedbacks = await feedback.paginate({ productId: req.params.productId },
            options
        );
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get All Feedback
router.get("/", verifyToken, async(req, res, next) => {
    try {
        const allFeedback = await feedback.find();
        res.status(200).json(allFeedback);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;