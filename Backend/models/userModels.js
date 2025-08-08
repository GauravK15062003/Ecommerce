const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a Valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false, //whenever DB give full details it should not contain password
  },
  avatar: {
    public_id: {
      //from Cloudinary
      type: String,
      default: null,
      // required: true,
    },
    url: {
      type: String,
      default: "https://res.cloudinary.com/dz1qj3k2h/image/upload/v1698851234/Profile.png",
      // required: true,

    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//hasing the password before creating/saving the entry of user in the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    //if only name and email is modified
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

//JWT TOKEN method of userschema
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error(
      "Password is undefined on user document. Did you use .select('+password')?"
    );
  }

  return await bcrypt.compare(enteredPassword, this.password);
};

// Genrating Passowrd Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // ..Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
