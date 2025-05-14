import OrderHistory from "./OrderHistory";
import Breadcrumb from "../components/Breadcrumb";

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
  return (
    <>
      <Breadcrumb
        title={"Lịch Sử Mua Hàng"}
        mainItem={"Trang chủ"}
        secondaryItem={"Lịch sử mua hàng"}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <div
        className="container-fluid"
        style={{ marginTop: "-1.5rem", marginBottom: "4rem" }}
      >
        <OrderHistory orders={orders} />
      </div>
    </>
  );
};
export default OrderTable;
