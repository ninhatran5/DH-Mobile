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
import TooltipText from "./TooltipText";
import {
  fetchOrder,
  fetchOrderDetail,
  receivedOrder,
} from "../slices/orderSlice";
import TooltipIcon from "./TooltipIcon";
import dayjs from "dayjs";
import useOrderRealtime from "../hooks/useOrderRealtime";

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
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [orderData, setOrderData] = useState(order);
  const userId = localStorage.getItem("userID");

  useOrderRealtime({
    userId,
    orderId: orderData.order_id,
    onOrderUpdate: (orderUpdate) => {
      setOrderData((prev) => ({
        ...prev,
        status: orderUpdate.status,
        payment_status: orderUpdate.payment_status,
        cancel_reason: orderUpdate.cancel_reason,
      }));
    },
    onReturnUpdate: (returnData) => {
      if (returnData.data) {
        setOrderData((prev) => ({
          ...prev,
          status: returnData.data.status,
          payment_status: returnData.data.payment_status,
          return_status: returnData.data.return_status,
        }));
      }
    },
  });

  useEffect(() => {
    const reviewedVariants = JSON.parse(
      localStorage.getItem("reviewedVariants") || "[]"
    );

    dispatch(fetchOrderDetail(orderData.order_id))
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
  }, [orderData.order_id, dispatch, refreshFlag]);

  useEffect(() => {
    setOrderData(order);
  }, [order]);

  const handleNextPageOrderDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  const handleOpenReasonModal = () => {
    setSelectedOrderId(orderData.order_id);
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
    dispatch(receivedOrder({ id: orderData.order_id }))
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
      case "đã hủy":
        return "order-status-canceled";
      case "yêu cầu hoàn hàng":
        return "order-status-return-requested";
      case "đã trả hàng":
        return "order-status-return-refund";
      case "đã hoàn tiền":
        return "order-status-refunded";
      case "đã chấp thuận":
        return "order-status-return-approved";
      case "đang xử lý":
        return "order-status-return-processing";
      case "đã từ chối":
        return "order-status-return-rejected";
      default:
        return "order-status-default";
    }
  };

  return (
    <>
      <tbody>
        <tr>
          <td
            onClick={() => handleNextPageOrderDetail(orderData.order_id)}
            style={{ fontWeight: 600, cursor: "pointer" }}
          >
            #{orderData?.order_code}
          </td>
          <td>{orderData?.customer}</td>
          <td>{orderData?.payment_method}</td>
          <td
            style={{
              color:
                orderData.payment_status?.toLowerCase() === "đã thanh toán"
                  ? "#28a745"
                  : "#dc3545",
              fontWeight: 600,
            }}
          >
            {orderData.payment_status}
          </td>
          <td>
            {dayjs(orderData?.created_at, "DD/MM/YYYY HH:mm:ss").format(
              "HH:mm - DD/MM/YYYY"
            )}
          </td>
          <td style={{ fontWeight: 600 }}>
            {NumberFormat(orderData?.total_amount)}
          </td>
          <td>
            <TooltipText
              id={`status-tooltip-${orderData.order_id}`}
              tooltip={
                orderData?.updated_at
                  ? `${t("orderDetail.updateDate")}: ${dayjs(
                      orderData.updated_at
                    ).format("HH:mm - DD/MM/YYYY")}`
                  : ""
              }
              className={getStatusClass(orderData?.status)}
            >
              {orderData?.status}
            </TooltipText>
          </td>
          <td>
            <TooltipIcon
              icon={FaEye}
              tooltip={t("orderHistory.viewDetail")}
              className="icon-circle"
              onClick={() => handleNextPageOrderDetail(orderData.order_id)}
            />
            {["chờ xác nhận"].includes(
              orderData?.status?.trim().toLowerCase()
            ) && (
              <TooltipIcon
                icon={FaTimes}
                tooltip={t("orderHistory.cancel")}
                className="icon-circle"
                onClick={() => handleCancelOrder(orderData.order_id)}
              />
            )}
            {["đã giao hàng"].includes(
              orderData?.status?.trim().toLowerCase()
            ) && (
              <TooltipIcon
                icon={FaDiagramSuccessor}
                tooltip={t("orderHistory.confirmReceived")}
                className="icon-circle"
                onClick={handleOpenReviewAlert}
              />
            )}
            {["hoàn thành"].includes(
              orderData?.status?.trim().toLowerCase()
            ) && (
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
                      setSelectedOrderId(orderData.order_id);
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
