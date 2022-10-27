const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const MFARoute = require("./routes/MFA");
const couponRoute = require("./routes/coupon");
const addressRoute = require("./routes/address");
const collectionRoute = require("./routes/collection");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
const shiprocketRoute = require("./routes/shiprocket");
const wishlistRoute = require("./routes/wishlist");
const feedbackRoute = require("./routes/feedback");
const webnotifyRoute = require("./routes/webnotify");
const coingateRoute = require("./routes/coingate");
const razorpayRoute = require("./routes/razorpay");

const Sentry = require("@sentry/node");

const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

Sentry.init({ dsn: "https://41afc8113ed144a0a209cb9e53cea55a@o1287528.ingest.sentry.io/4503925429501952" });

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connection Successfull!"))
    .catch((err) => {
        console.log(err);
    });


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/address", addressRoute);
app.use("/api/collection", collectionRoute);
app.use("/api/MFA", MFARoute);
app.use("/api/shopcart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/checkout", stripeRoute);
app.use("/api/shiprocket", shiprocketRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/webnotify", webnotifyRoute);
app.use("/api/coingate", coingateRoute);
app.use("/api/razorpay", razorpayRoute);


app.use(errorHandler);
const server = app.listen(process.env.PORT || 5000, () => {
    console.log("Backend server is running!");
});


// Socket Layer over Http Server
const socket = require('socket.io')(server);

app.set('socketio', socket);

socket.engine.on("headers", (headers, req) => {
        headers["Access-Control-Allow-Origin"] = "*"
        headers["Access-Control-Allow-Headers"] = "origin, x-requested-with, content-type"
        headers["Access-Control-Allow-Methodsn"] = "*"
    })
    // On every Client Connectionnj
socket.on('connection', socket => {
    console.log('Socket: client connected');
});