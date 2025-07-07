import OrderHistory from "./OrderHistory";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { cancelOrder, fetchOrder } from "../slices/orderSlice";
import Loading from "./Loading";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FaFilter } from "react-icons/fa";

const OrderTable = () => {
  const MySwal = withReactContent(Swal);
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { t } = useTranslation();
  const [tab, setTab] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  const TABS = [
    { label: t("orderHistory.all"), value: "all" },
    { label: t("orderHistory.waitingConfirm"), value: "chờ xác nhận" },
    { label: t("orderHistory.confirmed"), value: "đã xác nhận" },
    { label: t("orderHistory.waitingPickup"), value: "chờ lấy hàng" },
    { label: t("orderHistory.shipping"), value: "đang vận chuyển" },
    { label: t("orderHistory.delivering"), value: "đang giao hàng" },
    { label: t("orderHistory.delivered"), value: "đã giao hàng" },
    { label: t("orderHistory.completed"), value: "hoàn thành" },
    { label: t("orderHistory.cancelled"), value: "đã hủy" },
    { label: t("orderHistory.refunded"), value: "đã hoàn tiền" },
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
        dispatch(fetchOrder());
      } catch (error) {
        toast.error(error || t("orderHistory.cancelFailed"));
      }
    }
  };

  const filteredOrders = (orders?.orders || []).filter((order) =>
    tab === "all"
      ? true
      : order.status && order.status.trim().toLowerCase() === tab
  );

  useEffect(() => {
    dispatch(fetchOrder());
  }, [dispatch]);
  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("breadcrumbOrder.breadcrumbHeader")}
        mainItem={t("header.home")}
        secondaryItem={t("breadcrumbOrder.breadcrumbHeader")}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <div
        className="container-fluid"
        style={{
          marginTop: "-1.5rem",
          marginBottom: "4rem",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              fontWeight: 600,
              color: "#e40303",
              fontSize: 16,
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              transition: "background 0.18s",
            }}
            onClick={() => setShowFilter((v) => !v)}
          >
            <FaFilter
              style={{
                fontSize: 22,
                color: "#e40303",
                verticalAlign: "middle",
                marginRight: 4,
              }}
            />
            {t("orderHistory.filter")}
          </span>
          {showFilter && (
            <div className="order-table-filter-popup">
              <div>
                <div className="order-table-filter-title">
                  {" "}
                  {t("orderHistory.statusTitle")}:
                </div>
                <div className="order-table-filter-group">
                  {TABS.map((t) => (
                    <button
                      key={t.value}
                      className={`order-table-filter-btn${
                        tab === t.value ? " active" : ""
                      }`}
                      onClick={() => setTab(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="profile-table-wrapper">
          <table className="profile-table">
            <thead>
              <tr>
                <th>{t("orderHistory.orderCode")}</th>
                <th>{t("orderHistory.orderName")}</th>
                <th>{t("orderHistory.paymentMethod")}</th>
                <th>{t("orderHistory.payment_status")}</th>
                <th>{t("orderHistory.address")}</th>
                <th>{t("orderHistory.price")}</th>
                <th>{t("orderHistory.status")}</th>
                <th>{t("orderHistory.detail")}</th>
              </tr>
            </thead>
            {filteredOrders?.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", color: "#888" }}
                  >
                    {t("orderHistory.noOrder")}
                  </td>
                </tr>
              </tbody>
            ) : (
              filteredOrders?.map((order) => (
                <OrderHistory
                  key={order.order_id}
                  handleCancelOrder={handleCancelOrder}
                  order={order}
                />
              ))
            )}
          </table>
        </div>
      </div>
    </>
  );
};
export default OrderTable;
