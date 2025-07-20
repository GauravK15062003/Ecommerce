// import React, { Fragment } from "react";
// import { useSelector } from "react-redux";
// import {Routes, Route, useNavigate } from "react-router-dom";

// const ProtectedRoute = ({ component: Component, ...rest }) => {
//   const { loading, isAuthenticated, user } = useSelector((state) => state.user);
//   const navigate = useNavigate();
//   return (
//     <Fragment>
//       {loading === false && (
//         <Routes>
//           <Route
//           {...rest}
//           render={(props) => {
//             if (isAuthenticated === false) {
//               navigate("/login");
//             }

//             // if (isAdmin === true && user.role !== "admin") {
//             //   return <Redirect to="/login" />;
//             // }

//             return <Component {...props} />;
//           }}
//         />
//         </Routes>

//       )}
//     </Fragment>
//   );
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, isAdmin }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.user);

  if (loading === false) {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (isAdmin === true && user.role !== "admin") {
      return <Navigate to="/login" />;
    }

    return children;
  }

  // Optionally render a loader while loading
  return <p>Loading...</p>;
};


export default ProtectedRoute;
