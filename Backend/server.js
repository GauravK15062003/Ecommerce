const app = require("./app");
const connectDatabase = require("./config/database")
const dotenv = require("dotenv");
const cloudinary = require("cloudinary")

//Config
dotenv.config({path:"Backend/config/config.env"})

//Connecting to Database
connectDatabase()

//Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.API_SECRET
})

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})


