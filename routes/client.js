const Client = require("../models/Client");

const router = require("express").Router();

router.post("/", async(req, res, next) => {
    const newClient = new Client(req.body);

    try {
        const savedClient = await newClient.save();
        res.status(200).json(savedClient);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", async(req, res) => {
    try {
        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id, {
                $set: req.body,
            }, { new: true }
        );
        res.status(200).json(updatedClient);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", async(req, res) => {
    try {
        await Client.findByIdAndDelete(req.params.id);
        res.status(200).json("Client has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER
router.get("/find/:id", async(req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        res.status(200).json(client);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL USER 
router.get("/", async(req, res) => {

    try {
        const client = await Client.find();
        res.status(200).json(client);
    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;