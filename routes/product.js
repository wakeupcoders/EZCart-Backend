const Product = require("../models/Product");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");
const productSchema = require("../validators/productValidator");
const CustomErrorHandler = require("../services/CustomErrorHandler");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async(req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        return next(CustomErrorHandler.validationError(error.details[0].message));
    }

    try {
        const savedProduct = await new Product(req.body).save();
        res.status(200).json(savedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

//BULK CREATE
router.post("/bulkproduct", verifyTokenAndAdmin, async(req, res, next) => {
    // const { error } = productSchema.validate(req.body);
    // if (error) {
    //     return next(CustomErrorHandler.validationError(error.details[0].message));
    // }

    try {
        const savedProduct = await Product.insertMany(req.body);
        res.status(200).json(savedProduct);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async(req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async(req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET PRODUCT
router.get("/find/:id", async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/pids", async(req, res, next) => {
    try {
        const products = await Product.find({ _id: { $in: req.body.pids } });

        // const products = await Product.aggregate([{ $match: { price: { $gte: 200 } } },
        //     {
        //         $group: {
        //             _id: null,
        //             total: {
        //                 $sum: "$price"
        //             }
        //         }
        //     }
        // ]);

        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

router.post("/productsbyid", async(req, res, next) => {
    try {
        let productIds = [];
        let cartResponse = req.body.products || [];


        if (cartResponse.length <= 0) {
            return res.status(200).json({ status: false, _doc: [], message: "", total: 0 });
        }

        //Get all the IDS of products which are available for cart.
        cartResponse.forEach((element) => {
            productIds.push(element["productId"]);
        });

        //Fetch products by using product ids.
        const productsByIds = await Product.find({ _id: { $in: productIds } });

        //Mapping the Quantity to the products
        let result = await productsByIds.map((x) => {
            let itemData = cartResponse.find((item) => item.productId === x._id.toString());
            if (itemData) {
                x._doc.quantity = itemData.quantity;
                return x;
            }
        });

        //Find the Total of Products
        let totalPrice = result.reduce(function(accumulator, item) {
            return accumulator + item._doc.quantity * item._doc.price;
        }, 0);

        return res.status(200).json({ status: true, _doc: result, message: "", total: totalPrice });

    } catch (err) {
        next(err);
    }
});

// PRODUCT SEARCH
router.get("/search/:key", async(req, res) => {
    try {
        const { page, perpage } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(perpage, 10),
            sort: { createdAt: -1 },
        };

        products = await Product.paginate({
                $or: [
                    { title: { $regex: req.params.key } },
                    { desc: { $regex: req.params.key } },
                    { pcollection: { $regex: req.params.key } },
                ],
            },
            options
        );
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL PRODUCTS
router.get("/", async(req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    const { page, perpage } = req.query;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(perpage, 10),
    };
    try {
        let products;

        if (qNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(1);
        } else if (qCategory) {
            products = await Product.find({
                categories: {
                    $in: [qCategory],
                },
            });
        } else {
            products = await Product.paginate({}, options);
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;