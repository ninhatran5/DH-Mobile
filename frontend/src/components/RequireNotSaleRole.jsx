import { useSelector } from "react-redux";
import ErrorPage from "../pages/Error";
import Loading from "../components/Loading"; // nếu có component loading riêng

const RequireNotSaleRole = ({ children }) => {
  const { adminProfile } = useSelector((state) => state.adminProfile);
  const role = adminProfile?.user?.role;

  if (!role) {
    return <Loading />;
  }

  if (role === "sale") {
    return <ErrorPage />;
  }

  return children;
};

export default RequireNotSaleRole;
