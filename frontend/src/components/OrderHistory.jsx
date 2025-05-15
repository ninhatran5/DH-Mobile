import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const OrderHistory = ({ orders }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNextPageOrderDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  return (
    <div className="profile-table-wrapper">
      <table className="profile-table">
        <thead>
          <tr>
            <th>{t("orderHistory.orderCode")}</th>
            <th>{t("orderHistory.orderName")}</th>
            <th>{t("orderHistory.price")}</th>
            <th>{t("orderHistory.address")}</th>
            <th>{t("orderHistory.paymentMethod")}</th>
            <th>{t("orderHistory.status")}</th>
            <th>{t("orderHistory.detail")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ fontWeight: 600 }}>#{order.orderCode}</td>
              <td>{order.product}</td>
              <td>{order.price}</td>
              <td>{order.location}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.status}</td>
              <td onClick={() => handleNextPageOrderDetail(order.id)}>
                <span className="profile-label" style={{ cursor: "pointer" }}>
                  {t("orderHistory.viewDetail")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;
