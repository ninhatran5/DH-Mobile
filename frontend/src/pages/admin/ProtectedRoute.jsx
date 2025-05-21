import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken"); // Kiểm tra token của admin

  if (!isAuthenticated) {
    return <Navigate to="/AdminLogin" replace />;
  }
  return children;
};

export default ProtectedRoute;