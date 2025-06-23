/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NumberFormat from "../../utils/numberFormat";
import { FaEye, FaTimes } from "react-icons/fa";
import { PiKeyReturnFill } from "react-icons/pi";
import { FaDiagramSuccessor } from "react-icons/fa6";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { MdReviews } from "react-icons/md";
import ReturnReasonModal from "./ReturnReasonModal";
import ReturnRequestModal from "./ReturnRequestModal";
import ReviewModal from "./ReviewModal";
import { useDispatch } from "react-redux";
import { fetchOrder, receivedOrder } from "../slices/orderSlice";

const OrderHistory = ({ order, handleCancelOrder }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [caseType, setCaseType] = useState(1);
  const [isReviewed, setIsReviewed] = useState(false);

  useEffect(() => {
    // Kiểm tra localStorage để ẩn nút khi reload
    const reviewed = JSON.parse(localStorage.getItem("reviewedOrders") || "[]");
    setIsReviewed(reviewed.includes(order.order_id));
  }, [order.order_id]);

  const handleNextPageOrderDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  const handleOpenReasonModal = () => {
    setSelectedOrderId(order.order_id);
    setShowReasonModal(true);
  };

  const handleCloseReasonModal = () => {
    setShowReasonModal(false);
  };

  const handleOpenRequestModal = (type) => {
    setShowReasonModal(false);
    setCaseType(type);
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
  };

  const handleOpenReviewAlert = () => {
    dispatch(receivedOrder({ id: order.order_id }))
      .unwrap()
      .then(() => {
        Swal.fire({
          title: "Xác nhận đã nhận hàng thành công",
          icon: "success",
          confirmButtonText: "OK",
        });
        dispatch(fetchOrder());
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error || "Không thể xác nhận đã nhận hàng",
        });
      });
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
                style={{ cursor: "pointer", color: "red", marginRight: "12px" }}
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
                <FaDiagramSuccessor
                  onClick={handleOpenReviewAlert}
                  style={{ cursor: "pointer" }}
                  title="Xác nhận đã nhận hàng"
                />
              </>
            )}
            {["hoàn thành"].includes(order?.status?.trim().toLowerCase()) &&
              !isReviewed && (
                <MdReviews
                  onClick={() => {
                    setSelectedOrderId(order.order_id);
                    setShowReviewModal(true);
                  }}
                  style={{ cursor: "pointer", marginRight: "12px" }}
                  title="Đánh giá đơn hàng"
                />
              )}
          </td>
        </tr>
      </tbody>

      <ReturnReasonModal
        show={showReasonModal}
        handleClose={handleCloseReasonModal}
        handleOpenSubModal={handleOpenRequestModal}
      />

      {showRequestModal && selectedOrderId && (
        <ReturnRequestModal
          show={true}
          handleClose={handleCloseRequestModal}
          orderId={selectedOrderId}
          caseType={caseType}
        />
      )}

      {showReviewModal && selectedOrderId && (
        <ReviewModal
          show={true}
          handleClose={() => setShowReviewModal(false)}
          orderId={selectedOrderId}
          onSuccess={() => {
            // Lưu vào localStorage để ẩn nút khi reload
            const reviewed = JSON.parse(
              localStorage.getItem("reviewedOrders") || "[]"
            );
            if (!reviewed.includes(order.order_id)) {
              reviewed.push(order.order_id);
              localStorage.setItem("reviewedOrders", JSON.stringify(reviewed));
            }
            setIsReviewed(true);
            setShowReviewModal(false);
          }}
        />
      )}
    </>
  );
};

export default OrderHistory;
