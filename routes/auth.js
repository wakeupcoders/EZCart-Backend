const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const registerSchema = require("../validators/authValidators");
const googleRegisterSchema = require("../validators/googleAuthValidators");

const CustomErrorHandler = require("../services/CustomErrorHandler");
var { APP_URL } = require("../config/index");

const sendMail = require("../services/EmailService");

//REGISTER
router.post("/register", async(req, res, next) => {
    const userObj = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString(),
    };

    try {
        const user = await User.findOne({ email: req.body.email });
        const { error } = registerSchema.validate(req.body);
        if (error) {
            return next(CustomErrorHandler.validationError(error.details[0].message));
        }

        if (user) {
            return next(
                CustomErrorHandler.alreadyExist(
                    `The email ${req.body.email} is already exist.`
                )
            );
            // res.status(409).json({ message:  });
        } else {
            const convermationLink =
                `${APP_URL}/api/auth/register/activate/` +
                jwt.sign(userObj, process.env.JWT_SEC, { expiresIn: "3600s" });
            //Send a confirmation mail to the user.
            sendMail({
                    from: "cgqspider@gmail.com",
                    to: req.body.email,
                    subject: "Please Confirm Your Account",
                    text: `Account Confirmation`,
                    html: require("../templates/registerEmailTemplate")({
                        emailFrom: req.body.email,
                        name: req.body.name,
                        confirmLink: convermationLink,
                        // size: ' KB',
                        expires: "5 Minutes",
                    }),
                })
                .then(() => {
                    return res.json({ message: "Verification Email Sent!!" });
                    //return res.json({success: true});
                })
                .catch((err) => {
                    return res.status(500).json({ message: err });
                });
        }
        //res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Activate Email
router.get("/register/activate/:token", async(req, res) => {
    try {
        jwt.verify(req.params.token, process.env.JWT_SEC, async(err, user) => {
            if (err) {
                //Token is expired
                return res.redirect(`${process.env.FRONTEND_URL}/message?template=emailNotVerified`);
            } else {
                const newUser = new User(user);
                const savedUser = await newUser.save();
                return res.redirect(`${process.env.FRONTEND_URL}/message?template=emailVerified`);
                // res.status(200).json({
                //     message: `Your email ${savedUser.email} confirmed successfully`,
                // });
            }
        });
    } catch (err) {

        next(err);
    }
});

//LOGIN
router.post("/login", async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json("Wrong credentials!");
        }

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        );
        const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        if (OriginalPassword !== req.body.password) {
            return res.status(401).json("Wrong credentials!");
        } else {
            let accessToken = jwt.sign({
                    id: user._id,
                    isAdmin: user.isAdmin,
                },
                process.env.JWT_SEC, { expiresIn: "3d" }
            );

            const { password, ...others } = user._doc;

            if (user.MFAEnabled) {
                accessToken = "MFA VERIFICATION REQUIRED";
            }

            return res.status(200).json({...others, accessToken });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//LOGIN
router.post("/signInGoogle", async(req, res, next) => {
    try {
        const { error } = googleRegisterSchema.validate(req.body);
        console.log(req.body);
        console.log(error);
        if (error) {
            return next(CustomErrorHandler.validationError(error.details[0].message));
        }

        const user = await User.findOne({
            external_login_id: req.body.external_login_id,
        });
        var accessToken = "";
        var doc = {};
        if (!user) {
            const userObj = {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: CryptoJS.AES.encrypt(
                    req.body.password,
                    process.env.PASS_SEC
                ).toString(),
                external_login: req.body.external_login,
                external_login_id: req.body.external_login_id,
            };
            const newUser = new User(userObj);
            const savedUser = await newUser.save();
            accessToken = jwt.sign({
                    id: savedUser._id,
                    isAdmin: savedUser.isAdmin,
                },
                process.env.JWT_SEC, { expiresIn: "3d" }
            );
            //const { password, ...others } = savedUser._doc;
            doc = savedUser._doc;
        } else {
            accessToken = jwt.sign({
                    id: user._id,
                    isAdmin: user.isAdmin,
                },
                process.env.JWT_SEC, { expiresIn: "3d" }
            );
            doc = user._doc;
            // const { password, ...others } = user._doc;
        }

        res.status(200).json({ doc, accessToken });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

module.exports = router;