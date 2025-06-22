/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NumberFormat from "../../utils/numberFormat";
import { FaEye, FaTimes } from "react-icons/fa";
import { PiKeyReturnFill } from "react-icons/pi";
import { FaDiagramSuccessor } from "react-icons/fa6";
import { useState } from "react";
import ReturnReasonModal from "./ReturnReasonModal";
import ReturnRequestModal from "./ReturnRequestModal";

const OrderHistory = ({ order, handleCancelOrder }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNextPageOrderDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  // Modal state
  const [showReasonModal, setShowReasonModal] = useState(false); // Modal chọn lý do
  const [showRequestModal, setShowRequestModal] = useState(false); // Modal gửi yêu cầu
  const [selectedOrderId, setSelectedOrderId] = useState(null); // ID đơn hàng được chọn

  const handleOpenReasonModal = () => {
    setSelectedOrderId(order.order_id);
    setShowReasonModal(true);
  };

  const handleCloseReasonModal = () => {
    setShowReasonModal(false);
  };

  const handleOpenRequestModal = () => {
    setShowReasonModal(false); // Đóng modal lý do
    setShowRequestModal(true); // Mở modal gửi yêu cầu
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
  };

  return (
    <>
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
          <td style={{ fontWeight: 600 }}>
            {NumberFormat(order?.total_amount)}
          </td>
          <td>{order?.status}</td>
          <td>
            <FaEye
              title={t("orderHistory.vixxewDetail")}
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
            {["đã giao hàng"].includes(order?.status?.trim().toLowerCase()) && (
              <>
                <PiKeyReturnFill
                  onClick={handleOpenReasonModal}
                  style={{ cursor: "pointer", marginRight: "12px" }}
                  title="Yêu cầu trả hàng"
                />
                <FaDiagramSuccessor />
              </>
            )}
          </td>
        </tr>
      </tbody>

      {/* Modal chọn lý do trả hàng */}
      <ReturnReasonModal
        show={showReasonModal}
        handleClose={handleCloseReasonModal}
        handleOpenSubModal={handleOpenRequestModal}
      />

      {/* Modal gửi yêu cầu trả hàng */}
      {showRequestModal && selectedOrderId && (
        <ReturnRequestModal
          show={true}
          handleClose={handleCloseRequestModal}
          orderId={selectedOrderId}
        />
      )}
    </>
  );
};

export default OrderHistory;
