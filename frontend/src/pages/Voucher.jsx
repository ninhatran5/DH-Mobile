import { Link } from "react-router-dom";
import "../assets/css/voucher.css";
import Coupon from "../components/Coupon";
import Breadcrumb from "../components/Breadcrumb";

const Voucher = () => {
  const vouchers = [
    {
      id: 1,
      title: "Giảm giá 200.000 VNĐ cho đơn hàng đầu tiên",
      code: "BHNFASDIJFHIUASHJ",
    },
    {
      id: 2,
      title: "Giảm giá 10% cho khách hàng giới thiệu bạn bè",
      code: "JMAKSJFDKASJFK",
    },
    {
      id: 3,
      title: "Tặng mã giảm giá 50.000 VNĐ cho đơn hàng kế tiếp",
      code: "12312ASDFASFD",
    },
    {
      id: 4,
      title: "Giảm giá 20% cho sản phẩm phụ kiện",
      code: "214DSFDSF",
    },
  ];

  return (
    <>
      <Breadcrumb
        title={"Mã Giảm Giá"}
        mainItem={"Trang chủ"}
        secondaryItem={"Mã giảm giá"}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <section className="container-fluid">
        <div className="voucher_margin">
          <div className="row">
            {vouchers.map((voucher) => (
              <Coupon key={voucher.id} voucher={voucher} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
export default Voucher;
