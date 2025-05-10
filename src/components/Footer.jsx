import { LiaFacebookF } from "react-icons/lia";
import logo from "../assets/images/logo2.png";
import { FaBehance, FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  const iconLogoSocial = [
    {
      id: 1,
      icon: <LiaFacebookF />,
      link: "https://www.facebook.com/xengdayy",
    },
    {
      id: 2,
      icon: <FaInstagram />,
      link: "https://www.instagram.com/tungthuyfake",
    },
    {
      id: 3,
      icon: <FaGithub />,
      link: "https://github.com/LeNguyenXeng",
    },
    {
      id: 4,
      icon: <FaBehance />,
      link: "https://www.behance.net/lenguyenxeng",
    },
  ];

  const footerData = [
    {
      id: 1,
      title: "Thông tin",
      information: [
        { label: "Trang chủ", url: "/" },
        { label: "Sản phẩm", url: "/products" },
        { label: "Bài viết", url: "/blogs" },
        { label: "Giới thiệu", url: "/introduce" },
      ],
    },
    {
      id: 2,
      title: "Hỗ trợ khách hàng",
      information: [
        { label: "Chính sách bảo hành", url: "/guarantee" },
        { label: "Chính sách đổi trả", url: "/returnpolicy" },
        { label: "Chính sách giao hàng", url: "/deliverypolicy" },
      ],
    },
    {
      id: 3,
      title: "Kết nối với chúng tôi",
      information: [
        { label: "Hotline: 0396 180 619" },
        { label: "Chat với chúng tôi" },
      ],
    },
  ];

  return (
    <>
      <footer className="py-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-menu">
                <img src={logo} width="100%" alt="Logo DH Mobile" />
                <div className="social-links mt-5">
                  <ul className="d-flex list-unstyled gap-2">
                    {iconLogoSocial.map((item) => (
                      <li key={item.id} onClick={() => window.open(item.link)}>
                        <a href="#" className="btn btn-outline-light">
                          {item.icon}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {footerData.map((data) => (
              <div className="col-md-2 col-sm-6" key={data.id}>
                <div className="footer-menu">
                  <h5 className="widget-title">{data.title}</h5>
                  <ul className="menu-list list-unstyled">
                    {data.information.map((item, index) => (
                      <li key={index} className="menu-item">
                        <Link
                          to={item.url || "/"}
                          className="menu-des nav-link"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-menu">
                <h5 className="widget-title">Phản hồi với chúng tôi</h5>
                <p>Chúng tôi rất sẵn lòng lắng nghe các ý kiến của bạn</p>
                <form className="d-flex mt-3 gap-0" role="newsletter">
                  <input
                    className="form-control rounded-start rounded-0 bg-light"
                    type="email"
                    placeholder="Địa chỉ Email"
                    aria-label="Email Address"
                  />
                  <button
                    className="btn btn-dark rounded-end rounded-0"
                    type="submit"
                  >
                    Gửi
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
