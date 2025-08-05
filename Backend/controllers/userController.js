const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModels");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

//1.Register new User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "Ecommerce_Avatars",
    width: 150,
    crop: "scale",
  });
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password, // Hashed Password is stored in DB which done in user model
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  
  const message = `Welcome to Ecommerce, ${user.name}!\n\nYour account has been successfully created. You can now log in and start shopping.\n\nThank you for joining us!`;

  try {
    await sendEmail({
      //Options
      email: user.email,
      subject: `Welcome to Ecommerce`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  sendToken(user, 201, res); //Providing JWT Token
  // 
  });

//2.Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  // console.log("BODY",req.body);
  // console.log("FILE",req.file);
  const { email, password } = req.body;

  //checking if user has given email and password both
  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password"); //select field is false

  if (!user) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  sendToken(user, 200, res);
});

//3.Logout User
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    //Token ko null kr do
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//4.Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User Not found", 404));
  }

  // Get ResetPasswordToken
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Send the Url to user through email to resetPassword
  // const resetPasswordUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/password/reset/${resetToken}`;

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;


  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\nIf you have not requested this email then please ignore it.`;

  try {
    await sendEmail({
      //Options
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
      user,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

//5.Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token) //resetToken ko req params se nikal lenge
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, //Check the Expire time of the resetPasswordToken
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not matched", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined; //has no meaning once the password changed
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//6.Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  //ye route sirf whi kr paega jisne login kia hoga
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user, //Not contain Password bcoz select field in user model is false
  });
});

//7.Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  //ye route sirf whi kr paega jsne login kia hoga
  const user = await User.findById(req.user.id).select("+password"); //hmko user ka password bhi chaie

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old Password is Incorrect", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("New Password does not matched", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);

  res.status(200).json({
    success: true,
    user,
  });
});

//8.Update User Profiles
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  // console.log("BODY", req.body);
  // console.log("FILE", req.file);
  const newUserDetails = {
    name: req.body.name,
    email: req.body.email,
    //avatar
  };

  const avatar = req.file;

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    // console.log("User ID:", req.user?.id);

    const imageId = user?.avatar?.public_id;
    // console.log("Deleting image:", user?.avatar);
    if (imageId) {
      await cloudinary.v2.uploader.destroy(imageId);
    }

    let myCloud;

    try {
      myCloud = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              folder: "Ecommerce_Avatars",
              width: 150,
              crop: "scale",
            },
            (error, result) => {
              if (error) {
                // console.error("Cloudinary upload error:", error);
                reject(error);
              } else if (!result || !result.public_id) {
                // console.error("Cloudinary result missing public_id:", result);
                reject(new Error("Upload failed: public_id missing"));
              } else {
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Image upload failed",
      });
    }
    // console.log(newUserDetails);
    newUserDetails.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    // console.log(newUserDetails);
    // console.log(public_id);
  }

  // console.log(req.body);

  // We will add Cloudinary later

  //req.user.id means jo user login hoga
  const user = await User.findByIdAndUpdate(req.user.id, newUserDetails, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//9.Get Users Details --Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//10.Get Single User Details --Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User Does not Exist with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//11.Update User Role --Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserDetails = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    //avatar
  };

  //req.user.id means jo user login hoga
  const user = await User.findByIdAndUpdate(req.params.id, newUserDetails, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User Role Updated Successfully",
  });
});

//12.Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  //We will remove cloudinary later

  if (!user) {
    return next(
      new ErrorHander(`User Does not exist with Id: ${req.params.id}`)
    );
  }

  const imageId = user?.avatar?.public_id;
    // console.log("Deleting image:", user?.avatar);
    if (imageId) {
      await cloudinary.v2.uploader.destroy(imageId);
    }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
