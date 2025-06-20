/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NumberFormat from "../../utils/numberFormat";
import { FaEye, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const OrderHistory = ({ order, handleCancelOrder }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNextPageOrderDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  return (
    <tbody>
      <tr>
        <td
          onClick={() => handleNextPageOrderDetail(order.order_id)}
          style={{ fontWeight: 600, cursor: "pointer" }}
        >
          #{order?.order_code}
        </td>
        <td>{order?.customer}</td>
        <td>{order?.address}</td>
        <td>{order?.payment_method}</td>
        <td>{order?.payment_status}</td>
        <td style={{ fontWeight: 600 }}>{NumberFormat(order?.total_amount)}</td>
        <td>{order?.status}</td>
        <td>
          <FaEye
            title={t("orderHistory.viewDetail")}
            style={{ cursor: "pointer", marginRight: "12px" }}
            onClick={() => handleNextPageOrderDetail(order.order_id)}
          />
          {["chờ xác nhận", "đã xác nhận"].includes(
            order?.status?.trim().toLowerCase()
          ) && (
            <FaTimes
              title={t("orderHistory.cancel")}
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => handleCancelOrder(order.order_id)}
            />
          )}
        </td>
      </tr>
    </tbody>
  );
};

export default OrderHistory;
