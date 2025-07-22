import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NumberFormat from "../../utils/numberFormat";
import { FaTimes, FaEye } from "react-icons/fa";
import { PiKeyReturnFill } from "react-icons/pi";
import { FaDiagramSuccessor } from "react-icons/fa6";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { MdReviews } from "react-icons/md";
import ReturnReasonModal from "./ReturnReasonModal";
import ReturnRequestModal from "./ReturnRequestModal";
import ReviewModal from "./ReviewModal";
import { useDispatch } from "react-redux";
import "../assets/css/order-history.css";
import {
  fetchOrder,
  fetchOrderDetail,
  receivedOrder,
} from "../slices/orderSlice";
import TooltipIcon from "./TooltipIcon";
import dayjs from "dayjs";

const OrderHistory = ({ order, handleCancelOrder }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [caseType, setCaseType] = useState(1);
  const [hasReviewableProduct, setHasReviewableProduct] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0); // NEW

  useEffect(() => {
    const reviewedVariants = JSON.parse(
      localStorage.getItem("reviewedVariants") || "[]"
    );

    dispatch(fetchOrderDetail(order.order_id))
      .unwrap()
      .then((data) => {
        const products = data.products || [];
        const hasReviewables = products.some(
          (p) => !reviewedVariants.includes(p.variant_id)
        );
        setHasReviewableProduct(hasReviewables);
      })
      .catch(() => {
        setHasReviewableProduct(true);
      });
  }, [order.order_id, dispatch, refreshFlag]);

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
          title: t("order.confirmReceivedSuccessTitle"),
          icon: "success",
          confirmButtonText: t("order.confirmReceivedSuccessBtn"),
        });
        dispatch(fetchOrder());
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: t("order.confirmReceivedErrorTitle"),
          text: error || t("order.confirmReceivedErrorText"),
        });
      });
  };

  const getStatusClass = (status) => {
    const s = status?.trim().toLowerCase();
    switch (s) {
      case "chờ xác nhận":
        return "order-status-pending";
      case "đã xác nhận":
        return "order-status-confirmed";
      case "đang vận chuyển":
        return "order-status-shipping";
      case "đã giao hàng":
        return "order-status-shipped";
      case "hoàn thành":
        return "order-status-delivered";
      case "đã huỷ":
        return "order-status-canceled";
      default:
        return "order-status-default";
    }
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
          <td>{order?.payment_method}</td>
          <td
            style={{
              color:
                order.payment_status?.toLowerCase() === "đã thanh toán"
                  ? "#28a745"
                  : "#dc3545",
              fontWeight: 600,
            }}
          >
            {order.payment_status}
          </td>

          <td>
            {dayjs(order?.created_at, "DD/MM/YYYY HH:mm:ss").format(
              "HH:mm - DD/MM/YYYY"
            )}
          </td>
          <td style={{ fontWeight: 600 }}>
            {NumberFormat(order?.total_amount)}
          </td>
          <td className={getStatusClass(order?.status)}>{order?.status}</td>
          <td>
            <TooltipIcon
              icon={FaEye}
              tooltip={t("orderHistory.viewDetail")}
              className="icon-circle"
              onClick={() => handleNextPageOrderDetail(order.order_id)}
            />

            {["chờ xác nhận", "đã xác nhận"].includes(
              order?.status?.trim().toLowerCase()
            ) && (
              <TooltipIcon
                icon={FaTimes}
                tooltip={t("orderHistory.cancel")}
                className="icon-circle"
                onClick={() => handleCancelOrder(order.order_id)}
              />
            )}

            {["đã giao hàng"].includes(order?.status?.trim().toLowerCase()) && (
              <TooltipIcon
                icon={FaDiagramSuccessor}
                tooltip={t("orderHistory.confirmReceived")}
                className="icon-circle"
                onClick={handleOpenReviewAlert}
              />
            )}

            {["hoàn thành"].includes(order?.status?.trim().toLowerCase()) && (
              <>
                <TooltipIcon
                  icon={PiKeyReturnFill}
                  tooltip={t("orderHistory.returnRequest")}
                  className="icon-circle"
                  onClick={handleOpenReasonModal}
                />
                {hasReviewableProduct && (
                  <TooltipIcon
                    icon={MdReviews}
                    tooltip={t("orderHistory.reviewOrder")}
                    className="icon-circle"
                    onClick={() => {
                      setSelectedOrderId(order.order_id);
                      setShowReviewModal(true);
                    }}
                  />
                )}
              </>
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
          onSuccess={(variantId) => {
            const reviewed = JSON.parse(
              localStorage.getItem("reviewedVariants") || "[]"
            );
            if (!reviewed.includes(variantId)) {
              reviewed.push(variantId);
              localStorage.setItem(
                "reviewedVariants",
                JSON.stringify(reviewed)
              );
            }
            setShowReviewModal(false);
            setRefreshFlag((prev) => prev + 1);
          }}
        />
      )}
    </>
  );
};

export default OrderHistory;
