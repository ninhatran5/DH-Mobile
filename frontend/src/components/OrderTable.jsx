import OrderHistory from "./OrderHistory";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { cancelOrder, fetchOrder } from "../slices/orderSlice";
import Loading from "./Loading";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const OrderTable = () => {
  const MySwal = withReactContent(Swal);
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { t } = useTranslation();

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
        className="container"
        style={{
          marginTop: "-1.5rem",
          marginBottom: "4rem",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          padding: "1.5rem",
        }}
      >
        <div className="profile-table-wrapper">
          <table className="profile-table">
            <thead>
              <tr>
                <th>{t("orderHistory.orderCode")}</th>
                <th>{t("orderHistory.orderName")}</th>
                <th>{t("orderHistory.address")}</th>
                <th>{t("orderHistory.paymentMethod")}</th>
                <th>{t("orderHistory.payment_status")}</th>
                <th>{t("orderHistory.price")}</th>
                <th>{t("orderHistory.status")}</th>
                <th>{t("orderHistory.detail")}</th>
              </tr>
            </thead>
            {orders?.orders?.map((order) => (
              <OrderHistory
                key={order.order_id}
                handleCancelOrder={handleCancelOrder}
                order={order}
              />
            ))}
          </table>
        </div>
      </div>
    </>
  );
};
export default OrderTable;
