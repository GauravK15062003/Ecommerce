const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");


//1.Create Product Route -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  //get the name of user who created product
  let images = [];

  if( typeof req.body.images === "string") {
    images.push(req.body.images);
  }
  else {
    images = req.body.images;
  }
  const imagesLinks = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//2.Get All Products **(IMP-Understand this)**
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {

  // return next(new ErrorHander("This is my temp Error", 500));  //For Checking the Alerts
  const resultPerPage = 4;
  const productsCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
  
    
    
    apiFeature.pagination(resultPerPage)
    let products = await apiFeature.query;
    let filteredProductsCount = products.length;
    
    
    
    // products = await apiFeature.query;
  

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount
  });
});

//Get All products for Admin
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {

  const products = await Product.find()

  res.status(200).json({
    success: true,
    products,
  });
});

//3.Update products -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product Not Found", 404));
  }

  let images = [];

  if( typeof req.body.images === "string") {
    images.push(req.body.images);
  }
  else {
    images = req.body.images;
  }

  if(images !== undefined) {

    //Deleteing Images from cloudinary
    for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  };

  const imagesLinks = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  req.body.images = imagesLinks;
  
}
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });

  res.status(200).json({
    success: true,
    product,
    message: "Product Updated Succesfully",
  });
});

//4.Delete product -- Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product Not Found", 404));
  }

  //Deleting Images from Cloudinary
  for(let i=0; i<product.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    product,
    message: "Product Deleted Successfully",
  });
});

//5.Single Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product Found Successfully",
    product,
  
  });
});

//6.Create New Review or Update the review **(IMP-Understand this)**
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id, //User logged in
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  //Phle se user review kia hua h to update kr denge
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    //new review push kr denge reviews array m
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let sum = 0;
  product.reviews.forEach((rev) => {
    sum += rev.rating;
  }) ;
  let avg = sum / product.reviews.length;

  product.ratings = avg;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//7.Get All Reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  // const product = await Product.findById(req.params.id);

  const product = await Product.findById(req.query.id);

  if (!product) {
    if (!product) {
      return next(new ErrorHander("Product Not Found", 404));
    }
  }

  const reviews = product.reviews;

  return res.status(200).json({
    success: true,
    message: "Reviews Found Successfully",
    reviews,
  });
});

//8.Delete Review **(IMP-Understand this)**
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    if (!product) {
      return next(new ErrorHander("Product Not Found", 404));
    }
  }

  //Get all reviews which we do not want to delete
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if(reviews.length === 0) {
    ratings = 0;
  }
  else {
    ratings = avg / reviews.length;
  }

  

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    ratings,
    numOfReviews
  }, {
    new:true,
    runValidators:true,
    useFindAndModify:false
  });

  return res.status(200).json({
    success: true,
  });
});
