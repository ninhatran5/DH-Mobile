import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import ErrorPage from "../pages/Error";

const RequireNotSaleRole = ({ children }) => {
  const { profile } = useSelector((state) => state.profile);
  const role = profile?.user?.role;
  if (role === "sale") {
    return <ErrorPage />;
  }
  return children;
};

export default RequireNotSaleRole;
