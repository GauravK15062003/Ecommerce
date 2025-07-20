import {
  configureStore,
  combineReducers,
  // applyMiddleware,
} from "@reduxjs/toolkit";
import { newReviewReducer, productDetailsReducer, productsReducer, newProductReducer, productReducer, productReviewsReducer, reviewReducer } from "./reducers/productReducer";
// import thunk from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension";
import {profileReducer, userReducer, forgotPasswordReducer, allUsersReducer, userDetailsReducer} from "./reducers/userReducer";
import { cartReducer } from "./reducers/cartReducer";
import { allOrdersReducer, myOrdersReducer, newOrderReducer, orderDetailsReducer, orderReducer } from "./reducers/orderReducer copy";



const reducer = combineReducers({
    products: productsReducer,
    productDetails:productDetailsReducer,
    user: userReducer,
    profile: profileReducer,
    forgotPassword: forgotPasswordReducer,
    cart: cartReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    orderDetails: orderDetailsReducer,
    newReview: newReviewReducer,
    newProduct: newProductReducer,
    product: productReducer,
    order: orderReducer,
    allOrders: allOrdersReducer,
    allUsers: allUsersReducer,
    userDetails: userDetailsReducer,
    productReviews: productReviewsReducer,
    review: reviewReducer
});

let initialState = {
  cart: {
    cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems")) : [],
    shippingInfo: localStorage.getItem("shippingInfo")
    ? JSON.parse(localStorage.getItem("shippingInfo")) : {},
  }
};



const store = configureStore({
  reducer,
  preloadedState: initialState}
  // composeWithDevTools(applyMiddleware(...middleware))
);

store.subscribe(()=>{
  localStorage.setItem("cartItems", JSON.stringify(store.getState().cart.cartItems))
})


export default store;