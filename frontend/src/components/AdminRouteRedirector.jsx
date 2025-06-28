import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loading from "../components/Loading";

const AdminRouteRedirector = () => {
  const { adminProfile } = useSelector((state) => state.adminProfile);
  const role = adminProfile?.user?.role;

  if (!adminProfile || !role) {
    return <Loading />;
  }

  if (role === "sale") {
    return <Navigate to="/admin/chart" replace />;
  }

  return <Navigate to="/admin/product" replace />;
};

export default AdminRouteRedirector;
