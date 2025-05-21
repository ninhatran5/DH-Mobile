import { Navigate } from "react-router-dom";

const PublicRouteAdmin = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken");

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PublicRouteAdmin;
