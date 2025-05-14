import "../assets/css/profile.css";
import { Link } from "react-router-dom";
import OrderHistory from "../components/OrderHistory";
import Breadcrumb from "../components/Breadcrumb";

const Profile = () => {
  const personalInformations = [
    {
      id: 1,
      title: "Họ tên:",
      content: "Lê Nguyên Tùng",
    },
    {
      id: 2,
      title: "Số điện thoại:",
      content: "0396180619",
    },
    {
      id: 3,
      title: "Email:",
      content: "tung.ln@mor.com.vn",
    },
    {
      id: 4,
      title: "Quê quán:",
      content: "Thanh Hóa",
    },
  ];
  const statisticals = [
    {
      id: 1,
      label: "Đơn hàng của bạn",
      value: "5 đơn hàng",
    },
    {
      id: 2,
      label: "Số dư ví",
      value: "10.000VND",
    },
    { id: 3, label: "Sản phẩm đã thích", value: "10 sản phẩm" },
  ];
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

  const features = [
    {
      id: 1,
      name: "Đăng nhập vào admin",
      links: "/",
    },
    {
      id: 2,
      name: "Sản phẩm đã thích",
      links: "/favorite-products",
    },
    {
      id: 3,
      name: "Đơn hàng",
      links: "/",
    },
    {
      id: 4,
      name: "Đăng xuất",
    },
  ];
  return (
    <>
      <Breadcrumb
        title={"Hồ Sơ Cá Nhân"}
        mainItem={"Trang chủ"}
        secondaryItem={"Hồ sơ cá nhân"}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <div className="profile-content" style={{ marginTop: "-3rem" }}>
        <div className="container-fluid">
          <div className="profile-row">
            <div className="profile-col-full">
              <div className="profile-box profile-box-bg">
                <div className="profile-row">
                  <div className="profile-col-half">
                    <span className="profile-avatar">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar1.png"
                        alt="avatar"
                        className="profile-img"
                      />
                    </span>
                    <div className="profile-user-info">
                      <h4 className="profile-username">Lê Nguyên Tùng</h4>
                      <p className="profile-location">Thanh Hoa, Viet Nam</p>
                    </div>
                  </div>
                  <div className="profile-col-half">
                    <div className="profile-edit-wrapper">
                      <Link to={"/edit-profile"} className="profile-btn-edit">
                        <i className="mdi mdi-account-settings-variant" />
                        Chỉnh sửa
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-col-4">
              <div className="profile-card">
                <h4 className="profile-title">Giới thiệu</h4>
                <div className="profile-body">
                  <p className="profile-description">
                    Xin chào, tôi là Lê Nguyên Tùng...
                  </p>
                  <hr />
                  <h4 className="profile-title mb-2">Thông tin cá nhân</h4>
                  <div className="profile-info-list">
                    {personalInformations.map((personalInformation) => (
                      <p key={personalInformation.id}>
                        <strong>{personalInformation.title}</strong>{" "}
                        <span>{personalInformation.content}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-card profile-ribbon">
                <div className="profile-ribbon-title">Các tính năng</div>
                {features.map((feature) => (
                  <div key={feature.id} className="profile-messages">
                    <Link to={feature.links} className="profile-message-item">
                      <button className="profile-btn-reply">
                        {feature.name}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div className="profile-col-8">
              <div className="profile-row">
                {statisticals.map((item) => (
                  <div className="profile-col-4" key={item.id}>
                    <div className="profile-card">
                      <h6 className="profile-stat-label">{item.label}</h6>
                      <h2 className="profile-stat-value">{item.value}</h2>

                      <span className="profile-muted-text">
                        Theo thống kê bạn đã sử dụng
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="profile-card">
                <div className="d-flex col-12">
                  <h4 className="profile-title mb-3 col-9">Lịch sử mua hàng</h4>
                  <Link
                    to={"/order-history"}
                    className="text-decoration-none  col-3"
                  >
                    <h4 className="text-end profile-title mb-3">
                      Xem tất cả →
                    </h4>
                  </Link>
                </div>
                <OrderHistory orders={orders} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
