let { collection } = require("../models/Collection");
const Collection = require("../models/Collection");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAuthorization, async(req, res) => {
    const newCollection = new Collection(req.body);

    try {
        const savedCollection = await newCollection.save();
        res.status(200).json(savedCollection);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async(req, res) => {
    try {
        const updatedCollection = await Collection.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedCollection);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async(req, res) => {
    try {
        await Collection.findByIdAndDelete(req.params.id);
        res.status(200).json("Collection has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Collection SEARCH
router.get("/search/:key", verifyToken, async(req, res) => {
    try {

        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };


        collection = await Collection.paginate({
            "$or": [
                { colName: { $regex: req.params.key } },
                { colDesc: { $regex: req.params.key } },
            ]
        }, options);
        res.status(200).json(collection);

    } catch (err) {
        res.status(500).json(err);
    }
});


// //GET ALL

router.get("/", async(req, res) => {
    try {
        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };

        //const orders = await Order.find();
        collection = await Collection.paginate({}, options);
        res.status(200).json(collection);
    } catch (err) {
        res.status(500).json(err);
    }

});

module.exports = router;