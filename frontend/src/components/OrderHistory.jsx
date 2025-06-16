import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NumberFormat from "../../utils/numberFormat";

const OrderHistory = ({ order }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNextPageOrderDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  return (
    <tbody>
      <tr>
        <td style={{ fontWeight: 600 }}>#{order?.order_code}</td>
        <td>{order?.customer}</td>
        <td>{order?.address}</td>
        <td>{order?.payment_method}</td>
        <td style={{ fontWeight: 600 }}>{NumberFormat(order?.total_amount)}</td>
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
