const Newsletter = require("../models/Newsletter");
const router = require("express").Router();

//CREATE
router.post("/", async(req, res, next) => {
    const newNewsletter = new Newsletter(req.body);

    try {
        const savedNewsletter = await newNewsletter.save();
        res.status(200).json(savedNewsletter);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", async(req, res, next) => {
    try {
        const updatedNewsletter = await Newsletter.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedNewsletter);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", async(req, res, next) => {
    try {
        await Newsletter.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Newsletter has been deleted..."});
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER Query
router.get("/find/:newsletterId", async(req, res, next) => {
    try {
        const singleNewsletter = await Newsletter.find({ _id: req.params.newsletterId });
        res.status(200).json(singleNewsletter);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL
router.get("/", async(req, res, next) => {
    try {
        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
        };
        newsletter = await Newsletter.paginate({}, options);
        res.status(200).json(newsletter);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;