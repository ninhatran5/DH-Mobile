import OrderHistory from "./OrderHistory";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";

const OrderTable = () => {
  const orders = [
    {
      id: 1,
      orderCode: "ORD001",
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 2,
      orderCode: "ORD002",
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 3,
      orderCode: "ORD003",
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 4,
      orderCode: "ORD004",
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 5,
      orderCode: "ORD005",
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
  ];
  const { t } = useTranslation();

  return (
    <>
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
        <OrderHistory orders={orders} />
      </div>
    </>
  );
};
export default OrderTable;
