const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");
const cors = require("cors");


// Body parser


// ✅ Add this CORS middleware here
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://gaurav02ecommerce.netlify.app/"); // your frontend
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });



// Add this CORS setup
app.use(cors({
  origin: "https://gaurav02ecommerce.netlify.app", // allow local frontend
  credentials: true               // allow cookies if you're using them
}));

dotenv.config({path: "Backend/config/config.env"});
app.use(express.json({limit:'20mb'}))
app.use(cookieParser())



//imports Routes
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

//Middleware for error
app.use(errorMiddleware)


module.exports = app;