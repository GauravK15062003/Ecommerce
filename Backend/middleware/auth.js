const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels")


exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {
    const {token} = req.cookies;

    if(!token) {
        return next(new ErrorHander("Please Login to access this resources", 401));
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodeData.id);

    next();
    // console.log(token)
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        //if request not include role in roles array
        if(!roles.includes(req.user.role)){
            return next(
                new ErrorHander(`Role: ${req.user.role} is not allowed to access this resource`, 403)
            );
            
        }

        next();
    }
}