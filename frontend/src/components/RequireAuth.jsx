// src/components/RequireAuth.js
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token"); // Hoặc sessionStorage nếu bạn dùng cái đó
  const location = useLocation();

  if (!token) {
    return (
        <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  return children;
};

export default RequireAuth;
