import OrderHistory from "./OrderHistory";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchOrder } from "../slices/orderSlice";
import Loading from "./Loading";

const OrderTable = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { t } = useTranslation();

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
        <div className="profile-table-wrapper">
          <table className="profile-table">
            <thead>
              <tr>
                <th>{t("orderHistory.orderCode")}</th>
                <th>{t("orderHistory.orderName")}</th>
                <th>{t("orderHistory.address")}</th>
                <th>{t("orderHistory.paymentMethod")}</th>
                <th>{t("orderHistory.price")}</th>
                <th>{t("orderHistory.status")}</th>
                <th>{t("orderHistory.detail")}</th>
              </tr>
            </thead>
            {orders?.orders?.map((order) => (
              <OrderHistory key={order.order_id} order={order} />
            ))}
          </table>
        </div>
      </div>
    </>
  );
};
export default OrderTable;
