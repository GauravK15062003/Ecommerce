const app = require("./app");
const connectDatabase = require("./config/database")
const dotenv = require("dotenv");
const cloudinary = require("cloudinary")

//Config
dotenv.config({path:"./config/config.env"})

//Connecting to Database
connectDatabase()

console.log("⚠️ DEBUG_URL:", process.env.DEBUG_URL);
//Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.API_SECRET
})

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})


//Unhandled Promise Rejection
// process.on("unhandledRejection", err=>{
//     console.log(`Error: ${err.message}`);
//     console.log(`Shutitng down the server due to Unhandled Promise Rejection`);

//     server.close(() => {
//         process.exit(1);
//     })
// })