const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv");
const cors = require("cors");


// Add this CORS setup
app.use(cors({
  origin: "http://localhost:3001", // allow local frontend
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