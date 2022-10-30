const User = require("../models/User");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");
const CustomErrorHandler = require("../services/CustomErrorHandler");
const sendMail = require("../services/EmailService");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");


const router = require("express").Router();

//CREATE
router.post("/", async(req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(CustomErrorHandler.notFound(`The email ${req.body.email} is not exist.`));
        } else {

            // const link = `${process.env.FRONTEND_URL}/password-reset/${user._id}/${token.token}`;
            const userObj = {
                email: req.body.email,
                id: user._id
            }
            const convermationLink =
                `${process.env.FRONTEND_URL}/password-reset/${user._id}/` + jwt.sign(userObj, process.env.JWT_SEC, { expiresIn: "3600s" });
            //Send a confirmation mail to the user.
            sendMail({
                    from: "cgqspider@gmail.com",
                    to: req.body.email,
                    subject: "Reset Password Link",
                    text: `Reset Password`,
                    html: require("../templates/registerEmailTemplate")({
                        emailFrom: req.body.email,
                        name: "",
                        confirmLink: convermationLink,
                        // size: ' KB',
                        expires: "5 Minutes",
                    }),
                })
                .then(() => {
                    return res.json({ message: "Reset Password Link Sent!!!" });
                    //return res.json({success: true});
                })
                .catch((err) => {
                    return res.status(500).json({ message: err });
                });
        }

    } catch (err) {
        next(err)
    }
});

router.post("/:userId/:token", async(req, res, next) => {
    try {
        let user = await User.find({ _id: req.params.userId });
        if (!user) {
            return next(CustomErrorHandler.notFound(`The user is not exist.`));
        } else {

            jwt.verify(req.params.token, process.env.JWT_SEC, async(err, user) => {
                if (err) {
                    //Token is expired
                    return res.redirect(`${process.env.FRONTEND_URL}/message?template=emailNotVerified`);
                } else {
                    await User.findOneAndUpdate({ _id: req.params.userId }, {
                        $set: {
                            password: CryptoJS.AES.encrypt(
                                req.body.password,
                                process.env.PASS_SEC
                            ).toString()
                        }
                    })
                    return res.status(200).json({ message: "Password changed successfully!" });
                }
            });
        }

    } catch (err) {
        return next(err);
    }
});

module.exports = router;