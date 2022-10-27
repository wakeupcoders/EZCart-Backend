const MFA = require("../models/MFA");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const speakeasy = require("speakeasy");
var QRCode = require('qrcode');

const router = require("express").Router();

//Register for MFA
router.post("/register", verifyTokenAndAdmin, async(req, res, next) => {
    try {

        const userId = req.body.userId;
        const temp_secret = speakeasy.generateSecret();
        let savedMFA = await new MFA({ userId: userId, secret: temp_secret }).save();
        savedMFA = {...savedMFA._doc, qrImage: await QRCode.toDataURL(temp_secret.otpauth_url) };
        res.status(200).json(savedMFA);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Verify the status of MFA
router.post("/verify", async(req, res, next) => {
    const { userId, token } = req.body;
    try {
        //Check if user is enabled or not

        //Check if user is already verified dont take action

        //Find the User from the database
        const user = await MFA.find({ userId });

        const { base32: secret } = user[0].secret;
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2
        });
        if (verified) {
            // Update user data

            user[0].isVerified = true;
            const updatedProduct = await MFA.findByIdAndUpdate(
                user[0]._id, {
                    $set: user[0],
                }, { new: true }
            );

            const updatedUser = await User.findByIdAndUpdate(
                userId, {
                    $set: { MFAEnabled: true },
                }, { new: true }
            );

            const data = await User.findOne({ _id: userId });
            let accessToken = jwt.sign({
                    id: data._id,
                    isAdmin: data.isAdmin,
                },
                process.env.JWT_SEC, { expiresIn: "3d" }
            );

            const { password, ...others } = data._doc;



            res.json({...others, accessToken, verified: true })
        } else {
            res.json({ verified: false })
        }

        // const updatedMFA = await MFA.findByIdAndUpdate(
        //     req.params.id, {
        //         $set: req.body,
        //     }, { new: true }
        // );
        // res.status(200).json(updatedMFA);
    } catch (err) {
        res.status(500).json(err);
    }
});

//During validate first check if user is enabler and verified or not.

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async(req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, {
                $set: { MFAEnabled: false },
            }, { new: true }
        );
        await MFA.deleteOne({ userId: req.params.id });
        res.status(200).json("MFA has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET MFA
router.get("/find/:id", async(req, res) => {
    try {
        let user = await MFA.find({ userId: req.params.id });
        user = {...user[0]._doc, qrImage: await QRCode.toDataURL(user[0].secret.otpauth_url) }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;