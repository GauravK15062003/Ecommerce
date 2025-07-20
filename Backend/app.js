const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
// const fileUpload = require("express-fileupload");

dotenv.config({path: "./config/config.env"});

app.use(express.json({limit:'20mb'}))
app.use(cookieParser()) 
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(fileUpload);


//imports Routes
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

// app.use(express.static(path.join(__dirname, "../frontend/build")));
// app.get("*", (req, res) => {
//     res.sendFile(
//         path.resolve(__dirname, "../frontend/build/index.html"),
//         (err) => {
//             if (err) {
//                 res.status(500).send(err);
//             }})});

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

//Middleware for error
app.use(errorMiddleware)



module.exports = app;