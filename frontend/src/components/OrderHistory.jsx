import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const OrderHistory = ({ order }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNextPageOrderDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  return (
    <tbody>
      <tr>
        <td style={{ fontWeight: 600 }}>#{order?.order_id}</td>
        <td>{order?.order_id}</td>
        <td>{order?.payment_methods?.name}</td>
        <td>{order?.total_amount}</td>
        <td>{order?.paymentMethod}</td>
        <td>{order?.status}</td>
        <td onClick={() => handleNextPageOrderDetail(order?.order_id)}>
          <span className="profile-label" style={{ cursor: "pointer" }}>
            {t("orderHistory.viewDetail")}
          </span>
        </td>
      </tr>
    </tbody>
  );
};

export default OrderHistory;
