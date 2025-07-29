import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/order_detail.css";
import Breadcrumb from "./Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import useOrderRealtime from "../hooks/useOrderRealtime";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  cancelOrder,
  fetchOrderDetail,
  receivedOrder,
} from "../slices/orderSlice";
import Loading from "./Loading";
import numberFormat from "../../utils/numberFormat";
import OrderProductRow from "./OrderProductRow";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import withReactContent from "sweetalert2-react-content";
import ReturnReasonModal from "./ReturnReasonModal";
import ReturnRequestModal from "./ReturnRequestModal";
import ReviewModal from "./ReviewModal";
const removeVietnameseTones = (str) => {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

const OrderDetail = () => {
  const { t } = useTranslation();
  const MySwal = withReactContent(Swal);
  const dispatch = useDispatch();
  const { id } = useParams();
  const { orderDetail: reduxOrderDetail, loading } = useSelector(
    (state) => state.order
  );
  const navigate = useNavigate();
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [caseType, setCaseType] = useState(1);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [hasReviewableProduct, setHasReviewableProduct] = useState(false);
  const [orderDetail, setOrderDetail] = useState(reduxOrderDetail);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchOrderDetail(id));
  }, [id, dispatch]);

  useEffect(() => {
    setOrderDetail(reduxOrderDetail);
  }, [reduxOrderDetail]);

  useOrderRealtime({
    userId: localStorage.getItem("userID"),
    orderId: orderDetail?.order_id,
    onOrderUpdate: (orderUpdate) => {
      setOrderDetail((prev) => ({
        ...prev,
        status: orderUpdate.status,
        payment_status: orderUpdate.payment_status,
        cancel_reason: orderUpdate.cancel_reason,
      }));
    },
    onReturnUpdate: (returnData) => {
      if (returnData.data) {
        setOrderDetail((prev) => ({
          ...prev,
          status: returnData.data.status || prev.status,
        }));
      }
    },
  });

  useEffect(() => {
    const reviewedVariants = JSON.parse(
      localStorage.getItem("reviewedVariants") || "[]"
    );
    const products = orderDetail?.products || [];
    const hasReviewables = products.some(
      (p) => !reviewedVariants.includes(p.variant_id)
    );
    setHasReviewableProduct(hasReviewables);
  }, [orderDetail?.products, refreshFlag]);

  const handleNextOrderHistory = () => {
    navigate("/order-history");
  };

  const statusMap = {
    "cho xac nhan": "pending",
    "da xac nhan": "confirmed",
    "dang van chuyen": "shipping",
    "da giao hang": "shipped",
    "hoan thanh": "delivered",
    "da huy": "canceled",
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
      case "đã chấp thuận":
        return "order-status-return-approved";
      case "đang xử lý":
        return "order-status-return-processing";
      case "đã hoàn tiền":
        return "order-status-refunded";
      case "đã trả hàng":
        return "order-status-return-refund";
      default:
        return "order-status-default";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "payment-paid";
      case "Chưa thanh toán":
        return "payment-unpaid";
      default:
        return "";
    }
  };

  const normalizedStatus = removeVietnameseTones(orderDetail?.status || "");
  const currentStatusKey = statusMap[normalizedStatus] || "pending";
  const isCanceled = currentStatusKey === "canceled";
  const isReturn = [
    "order-status-return-requested",
    "order-status-return-approved",
    "order-status-return-processing",
    "order-status-return-refund"
  ].includes(getStatusClass(orderDetail?.status));

  const statusOrder = isCanceled
    ? ["pending", "confirmed", "canceled"]
    : isReturn
      ? [
          "return-requested",
          "return-approved",
          "return-processing",
          "return-refund"
        ]
      : ["pending", "confirmed", "shipping", "shipped", "delivered"];

  let currentStatusIndex;
  if (isReturn) {
    const returnStatusMap = {
      "order-status-return-requested": 0,
      "order-status-return-approved": 1,
      "order-status-return-processing": 2,
      "order-status-return-refund": 3,
    };
    currentStatusIndex = returnStatusMap[getStatusClass(orderDetail?.status)] ?? 0;
  } else {
    currentStatusIndex = statusOrder.indexOf(currentStatusKey);
  }

  const statusSteps = statusOrder.map((key, idx) => ({
    label: isReturn
      ? t(`order_status.${key}`)
      : t(`order_status.${key}`),
    active: idx <= currentStatusIndex,
  }));

  const receiverInfo = [
    {
      label: t("orderDetail.receiver"),
      value: orderDetail?.customer || t("toast.pending_update"),
    },
    {
      label: t("orderDetail.email"),
      value: orderDetail?.email || t("toast.pending_update"),
    },
    {
      label: t("orderDetail.phone"),
      value: orderDetail?.phone || t("toast.pending_update"),
    },
    {
      label: t("orderDetail.address"),
      value: orderDetail?.address || t("toast.pending_update"),
    },
  ];

  const orderInfo = [
    {
      label: t("orderDetail.paymentMethod"),
      value: orderDetail?.payment_method?.[1] || t("toast.pending_update"),
    },
    {
      label: t("orderDetail.payment_status_note"),
      value: (
        <span className={getPaymentStatusClass(orderDetail?.payment_status)}>
          {orderDetail?.payment_status || t("toast.pending_update")}
        </span>
      ),
    },

    ...(Number(orderDetail?.voucher_discount) > 0
      ? [
          {
            label: t("orderDetail.amountIsReduced"),
            value: (
              <span style={{ fontWeight: "bold" }}>
                - {numberFormat(orderDetail?.voucher_discount)}
              </span>
            ),
          },
        ]
      : []),
    ...(Number(orderDetail?.rank_discount) > 0
      ? [
          {
            label: t("orderDetail.rankDiscountInfo"),
            value: (
              <span style={{ fontWeight: "bold" }}>
                - {numberFormat(orderDetail?.rank_discount)}
              </span>
            ),
          },
        ]
      : []),

    {
      label: t("orderDetail.order_date"),
      value:
        orderDetail?.order_date && dayjs(orderDetail?.order_date).isValid()
          ? dayjs(orderDetail?.order_date).format("HH:mm - DD/MM/YYYY")
          : t("toast.pending_update"),
    },
    {
      label: t("orderDetail.order_status_note"),
      value: (
        <span className={getStatusClass(orderDetail?.status)}>
          {orderDetail?.status || t("toast.pending_update")}
        </span>
      ),
    },
  ];

  const totalAmount = Number(orderDetail?.total_amount) || 0;
  const discount = Number(orderDetail?.voucher_discount) || 0;
  const rankDiscount = Number(orderDetail?.rank_discount) || 0;
  const priceBeforeDiscount = totalAmount + discount + rankDiscount;
  const totalBeforeDiscount = numberFormat(priceBeforeDiscount);

  const handleCancelOrder = async (orderId) => {
    const result = await MySwal.fire({
      title: t("orderHistory.cancelOrder"),
      text: t("orderHistory.enterCancelReason"),
      input: "text",
      inputPlaceholder: t("orderHistory.reasonPlaceholder"),
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: t("orderHistory.confirm"),
      cancelButtonText: t("orderHistory.close"),
      inputValidator: (value) => {
        if (!value) return t("orderHistory.emptyReasonError");
      },
    });

    if (result.isConfirmed) {
      const reason = result.value;
      try {
        await dispatch(cancelOrder({ id: orderId, reason })).unwrap();
        toast.success(t("orderHistory.cancelSuccess"));
        dispatch(fetchOrderDetail(orderId));
      } catch (error) {
        toast.error(error || t("orderHistory.cancelFailed"));
      }
    }
  };

  const handleConfirmReceived = async () => {
    try {
      await dispatch(receivedOrder({ id: orderDetail.order_id })).unwrap();
      Swal.fire({
        title: t("order.confirmReceivedSuccessTitle"),
        icon: "success",
        confirmButtonText: t("order.confirmReceivedSuccessBtn"),
      });
      dispatch(fetchOrderDetail(orderDetail.order_id));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("order.confirmReceivedErrorTitle"),
        text: error || t("order.confirmReceivedErrorText"),
      });
    }
  };

  const handleOpenReasonModal = () => setShowReasonModal(true);
  const handleCloseReasonModal = () => setShowReasonModal(false);
  const handleOpenRequestModal = (type) => {
    setShowReasonModal(false);
    setCaseType(type);
    setShowRequestModal(true);
  };
  const handleCloseRequestModal = () => setShowRequestModal(false);
  const handleOpenReviewModal = () => setShowReviewModal(true);
  const handleCloseReviewModal = () => setShowReviewModal(false);

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("orderDetail.title")}
        mainItem={t("orderDetail.home")}
        mainItem2={t("orderDetail.orderList")}
        secondaryItem={t("orderDetail.title")}
        linkMainItem={"/"}
        linkMainItem2={"/order-history"}
      />
      <div
        className="card_order_detail container-fluid px-1 px-md-4 py-5 mx-auto"
        style={{ marginTop: "30px" }}
      >
        <div className="row d-flex justify-content-between px-3">
          <div className="d-flex">
            <h5>
              {t("orderDetail.order")}:{" "}
              <span
                style={{ color: "#ff8800" }}
                className="font-weight-bold ms-2"
              >
                #{orderDetail?.order_code || t("toast.pending_update")}
              </span>
            </h5>
          </div>
          <div className="d-flex flex-column text-sm-right">
            <p className="mb-0">
              {t("orderDetail.orderDate")}:{" "}
              {orderDetail?.order_date &&
              dayjs(orderDetail.order_date).isValid()
                ? dayjs(orderDetail.order_date).format("HH:mm - DD/MM/YYYY")
                : t("toast.pending_update")}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="row d-flex justify-content-center">
          <div className="col-12">
            <ul id="progressbar">
              {statusSteps.map((step, index) => (
                <li
                  key={index}
                  className={`step0 ${step.active ? "active" : ""} 
                    ${index === currentStatusIndex ? "current" : ""} 
                    ${currentStatusKey === "canceled" ? "canceled" : ""}
                    ${isReturn ? "return-order-step" : ""}`}
                >
                  <span className="step-label">{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Info */}
        <div className="row px-3 mt-3">
          <div className="col-12">
            {/* Receiver Info */}
            <div className="order-info-table mb-4">
              <h5 className="mb-3">{t("orderDetail.receiverInfo")}</h5>
              <table className="table table-bordered">
                <tbody>
                  {receiverInfo.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold" style={{ width: "30%" }}>
                        {item.label}
                      </td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Info */}
            <div className="order-info-table mb-4 mt-5">
              <h5 className="mb-3">{t("orderDetail.orderInfo")}</h5>
              <table className="table table-bordered">
                <tbody>
                  {orderInfo.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold" style={{ width: "30%" }}>
                        {item.label}
                      </td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="row px-3 mt-4">
          <div className="col-12">
            <div className="product-table">
              <h5 className="mb-3">{t("orderDetail.productDetail")}</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="bg-light">
                    <tr>
                      <th>{t("orderDetail.image")}</th>
                      <th>{t("orderDetail.product")}</th>
                      <th>{t("orderDetail.quantity")}</th>
                      <th>{t("orderDetail.color")}</th>
                      <th>{t("orderDetail.version")}</th>
                      <th>{t("orderDetail.unitPrice")}</th>
                      <th>{t("orderDetail.totalPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orderDetail?.products || []).map((order, index) => (
                      <OrderProductRow key={index} product={order} />
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan="6" className="text-end fw-bold">
                        {t("orderDetail.total")}
                      </td>
                      <td className="d-flex" style={{ gap: "7px" }}>
                        <span className="fw-bold" style={{ color: "#ff8800" }}>
                          {numberFormat(totalAmount) ||
                            t("toast.pending_update")}
                        </span>
                        {(discount > 0 || rankDiscount > 0) && (
                          <small className="total_before_discount fw-bold">
                            {totalBeforeDiscount}
                          </small>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Actions */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button onClick={handleNextOrderHistory} className="btn-back">
                    <IoChevronBackOutline />
                    {t("orderDetail.back")}
                  </button>
                  <div className="d-flex gap-2">
                    {["Chờ xác nhận"].includes(orderDetail?.status) && (
                      <button
                        className="btn-cancel-order"
                        onClick={() => handleCancelOrder(orderDetail.order_id)}
                      >
                        {t("orderHistory.cancel")}
                      </button>
                    )}
                    {orderDetail?.status === "Đã giao hàng" && (
                      <button
                        className="btn-review-order"
                        onClick={handleConfirmReceived}
                      >
                        {t("orderHistory.confirmReceived")}
                      </button>
                    )}
                    {orderDetail?.status === "Hoàn thành" && (
                      <>
                        <button
                          className="btn-return-order"
                          onClick={handleOpenReasonModal}
                        >
                          {t("orderHistory.returnRequest")}
                        </button>
                        {hasReviewableProduct && (
                          <button
                            className="btn-review-order"
                            onClick={handleOpenReviewModal}
                          >
                            {t("orderHistory.reviewOrder")}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReturnReasonModal
        show={showReasonModal}
        handleClose={handleCloseReasonModal}
        handleOpenSubModal={handleOpenRequestModal}
      />
      {showRequestModal && (
        <ReturnRequestModal
          show={true}
          handleClose={handleCloseRequestModal}
          orderId={orderDetail.order_id}
          caseType={caseType}
        />
      )}
      {showReviewModal && (
        <ReviewModal
          show={true}
          handleClose={handleCloseReviewModal}
          orderId={orderDetail.order_id}
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
            handleCloseReviewModal();
            setRefreshFlag((prev) => prev + 1);
          }}
        />
      )}
    </>
  );
};

export default OrderDetail;
