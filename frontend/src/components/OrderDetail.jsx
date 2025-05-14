import "../assets/css/order_detail.css";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import Breadcrumb from "./Breadcrumb";

const OrderDetail = () => {
  const statusSteps = [
    { label: "Chờ xác nhận", active: true },
    { label: "Đã xác nhận", active: true },
    { label: "Chờ lấy hàng", active: true },
    { label: "Đang giao hàng", active: false },
    { label: "Giao hàng thành công", active: false },
  ];

  const orderInfo = [
    { label: "Người nhận", value: "Nguyễn Văn A" },
    { label: "Số điện thoại", value: "0123456789" },
    { label: "Địa chỉ", value: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" },
    {
      label: "Phương thức thanh toán",
      value: "Thanh toán khi nhận hàng (COD)",
    },
    { label: "Ghi chú", value: "Giao hàng giờ hành chính" },
  ];

  const products = [
    {
      name: "iPhone 14 Pro Max",
      image: iphone,
      quantity: 2,
      color: "Tím",
      version: "256GB",
      unitPrice: "27.990.000₫",
      totalPrice: "55.980.000₫",
    },
  ];

  const totalAmount = "56.010.000₫";

  return (
    <>
      <Breadcrumb
        title={"Chi Tiết Đơn Hàng"}
        mainItem={"Trang chủ"}
        mainItem2={"Đơn hàng"}
        secondaryItem={"Chi tiết đơn hàng"}
        linkMainItem={"/"}
        linkMainItem2={"/order-history"}
      />
      <div className="card_order_detail container-fluid px-1 px-md-4 py-5 mx-auto">
        <div className="row d-flex justify-content-between px-3">
          <div className="d-flex">
            <h5>
              ĐƠN HÀNG:
              <span
                className="text-primary font-weight-bold"
                style={{ marginLeft: 8 }}
              >
                #Y34XDHR
              </span>
            </h5>
          </div>
          <div className="d-flex flex-column text-sm-right">
            <p className="mb-0">
              Ngày đặt hàng: <span>01/12/19</span>
            </p>
          </div>
        </div>

        <div className="row d-flex justify-content-center">
          <div className="col-12">
            <ul id="progressbar">
              {statusSteps.map((step, index) => (
                <li
                  key={index}
                  className={`step0 ${step.active ? "active" : ""}`}
                >
                  <span className="step-label">{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="row px-3 mt-4">
          <div className="col-12">
            <div className="order-info-table">
              <h5 className="mb-3">Thông tin đặt hàng</h5>
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

        {/* Chi tiết sản phẩm */}
        <div className="row px-3 mt-4">
          <div className="col-12">
            <div className="product-table">
              <h5 className="mb-3">Chi tiết sản phẩm</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="bg-light">
                    <tr>
                      <th>Sản Phẩm</th>
                      <th>Số Lượng</th>
                      <th>Màu sắc</th>
                      <th>Phiên bản</th>
                      <th>Đơn giá</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="me-2"
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                              }}
                            />
                            <div className="fw-bold">{p.name}</div>
                          </div>
                        </td>
                        <td className="align-middle">{p.quantity}</td>
                        <td className="align-middle">{p.color}</td>
                        <td className="align-middle">{p.version}</td>
                        <td className="align-middle">{p.unitPrice}</td>
                        <td className="align-middle fw-bold">{p.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan="5" className="text-end fw-bold">
                        Tổng cộng
                      </td>
                      <td className="fw-bold text-primary">{totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
