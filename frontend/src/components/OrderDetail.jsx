import { Link, useParams } from "react-router-dom";
import "../assets/css/order_detail.css";
import Breadcrumb from "./Breadcrumb";
import { useTranslation } from "react-i18next";
import { RiArrowGoBackFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { cancelOrder, fetchOrderDetail } from "../slices/orderSlice";
import Loading from "./Loading";
import numberFormat from "../../utils/numberFormat";
import OrderProductRow from "./OrderProductRow";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import withReactContent from "sweetalert2-react-content";

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
  const { orderDetail, loading } = useSelector((state) => state.order);
  useEffect(() => {
    if (!id) return;
    dispatch(fetchOrderDetail(id));

    const interval = setInterval(() => {
      dispatch(fetchOrderDetail(id));
    }, 5000);

    return () => clearInterval(interval);
  }, [id, dispatch]);

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
      case "đã huỷ":
        return "order-status-canceled";
      default:
        return "order-status-default";
    }
  };

  const normalizedStatus = removeVietnameseTones(orderDetail?.status || "");
  const currentStatusKey = statusMap[normalizedStatus] || "pending";

  const isCanceled = currentStatusKey === "canceled";

  const statusOrder = isCanceled
    ? ["pending", "confirmed", "canceled"]
    : [
        "pending",
        "confirmed",
        "shipping",
        "delivering",
        "shipped",
        "delivered",
      ];

  const currentStatusIndex = statusOrder.indexOf(currentStatusKey);

  const statusSteps = statusOrder.map((key, idx) => ({
    label: t(`order_status.${key}`),
    active: idx <= currentStatusIndex,
  }));

  const receiverInfo = [
    {
      label: t("orderDetail.receiver"),
      value: orderDetail?.customer || t("toast.pending_update"),
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
      value: orderDetail?.payment_status || t("toast.pending_update"),
    },
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
        dispatch(fetchOrderDetail());
      } catch (error) {
        toast.error(error || t("orderHistory.cancelFailed"));
      }
    }
  };
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
      <div className="card_order_detail container-fluid px-1 px-md-4 py-5 mx-auto">
        <div className="row d-flex justify-content-between px-3">
          <div className="d-flex">
            <h5>
              {t("orderDetail.order")}:
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
              <span>
                {orderDetail?.order_date &&
                dayjs(orderDetail.order_date).isValid()
                  ? dayjs(orderDetail.order_date).format("HH:mm - DD/MM/YYYY")
                  : t("toast.pending_update")}
              </span>
            </p>
          </div>
        </div>

        <div className="row d-flex justify-content-center">
          <div className="col-12">
            <ul id="progressbar">
              {statusSteps.map((step, index) => (
                <li
                  key={index}
                  className={`step0 
                    ${step.active ? "active" : ""} 
                    ${index === currentStatusIndex ? "current" : ""} 
                    ${currentStatusKey === "canceled" ? "canceled" : ""}
                  `}
                >
                  <span className="step-label">{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="row px-3 mt-3">
          <div className="col-12">
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
                      <td className="fw-bold" style={{ color: "#ff8800" }}>
                        {numberFormat(orderDetail?.total_amount) ||
                          t("toast.pending_update")}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <Link to="/order-history" className="btn-back fw-bold">
                    <RiArrowGoBackFill />
                    <span>{t("orderDetail.back")}</span>
                  </Link>
                  {(orderDetail?.status === "Chờ xác nhận" ||
                    orderDetail?.status === "Đã xác nhận") && (
                    <button
                      className="btn-cancel-order"
                      onClick={() => handleCancelOrder(orderDetail.order_id)}
                    >
                      {t("orderHistory.cancel")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
