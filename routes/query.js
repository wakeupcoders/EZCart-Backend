const Query = require("../models/Query");
const router = require("express").Router();

//CREATE
router.post("/", async(req, res, next) => {
    const newQuery = new Query(req.body);

    try {
        const savedQuery = await newQuery.save();
        res.status(200).json(savedQuery);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", async(req, res, next) => {
    try {
        const updatedQuery = await Query.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedQuery);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", async(req, res, next) => {
    try {
        await Query.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Query has been deleted..."});
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER Query
router.get("/find/:queryId", async(req, res, next) => {
    try {
        const singleQuery = await Query.find({ _id: req.params.queryId });
        res.status(200).json(singleQuery);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL
router.get("/", async(req, res, next) => {
    try {
        const allQuery = await Query.find();
        res.status(200).json(allQuery);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;