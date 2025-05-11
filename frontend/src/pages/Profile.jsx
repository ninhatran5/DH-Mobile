import "../assets/css/profile.css";
import { Link } from "react-router-dom";

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
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 2,
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 3,
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 4,
      product: "ÁKDFJK",
      price: "1.000.000₫",
      location: "Thanh Hóa",
      paymentMethod: "Thanh toán online",
      status: "Đang giao hàng",
    },
    {
      id: 5,
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
      name: "Lịch sử đơn hàng",
      links: "/",
    },
    {
      id: 3,
      name: "Đăng xuất",
    },
  ];
  return (
    <>
      <section className="breadcrumb-option">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>Hồ sơ cá nhân</h4>
                <div className="breadcrumb__links">
                  <Link style={{ textDecoration: "none" }} to={"/"}>
                    Trang chủ
                  </Link>
                  <span>Hồ sơ cá nhân</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="profile-content">
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
                      <button type="button" className="profile-btn-edit">
                        <i className="mdi mdi-account-settings-variant" />
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-col-4">
              <div className="profile-card">
                <h4 className="profile-title">Thông tin cá nhân</h4>
                <div className="profile-body">
                  <p className="profile-description">
                    Xin chào, tôi là Lê Nguyên Tùng...
                  </p>
                  <hr />
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
                  <h4 className="profile-title mb-3 col-9">Lịch sử đơn hàng</h4>
                  <Link className="text-decoration-none  col-3">
                    <h4 className="text-end profile-title mb-3">
                      Xem tất cả →
                    </h4>
                  </Link>
                </div>
                <div className="profile-table-wrapper">
                  <table className="profile-table">
                    <thead>
                      <tr>
                        <th>Tên đơn hàng</th>
                        <th>Giá tiền</th>
                        <th>Địa chỉ</th>
                        <th>Phương thức thanh toán</th>
                        <th>Trạng thái</th>
                        <th>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.product}</td>
                          <td>{order.price}</td>
                          <td>{order.location}</td>
                          <td>{order.paymentMethod}</td>
                          <td>{order.status}</td>
                          <td>
                            <span className="profile-label">Xem chi tiết</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
