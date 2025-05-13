import logo from "../assets/images/logo2.png";
import { RiUserLine } from "react-icons/ri";
import { CgSearch } from "react-icons/cg";
import { IoMdHeartEmpty } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import VietNam from "../assets/images/vietnam.png";
import Anh from "../assets/images/england.png";
import "../assets/css/header.css";
import { useTranslation } from "react-i18next";

export default function Header() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const iconNavbars = [
    {
      id: 1,
      icon: <FiShoppingCart />,
      link: "/shoppingcart",
    },
    {
      id: 2,
      icon: <RiUserLine />,
      link: "/login",
    },
    {
      id: 3,
      icon: <IoMdHeartEmpty />,
      link: "/",
    },
    {
      id: 4,
      icon: <CgSearch />,
      link: "/",
    },
  ];

  const services = [
    {
      id: 1,
      nameService: "Chính sách bảo hành",
      link: "/guarantee",
    },
    {
      id: 2,
      nameService: "Chính sách đổi trả",
      link: "/returnpolicy",
    },
    {
      id: 3,
      nameService: "Chính sách giao hàng",
      link: "/deliverypolicy",
    },
    {
      id: 4,
      nameService: "Kiểm tra IMEI",
      link: "/checkimei",
    },
  ];
  const langues = [
    {
      id: 1,
      name: "Tiếng Anh",
      flag: Anh,
    },
    {
      id: 2,
      name: "Tiếng Việt",
      flag: VietNam,
    },
  ];
  const navbars = [
    {
      id: 1,
      name: "Trang chủ",
      link: "/",
    },
    {
      id: 2,
      name: "Sản phẩm",
      link: "/products",
    },
    {
      id: 3,
      name: "Mã giảm giá",
      link: "/voucher",
    },
    {
      id: 4,
      name: "Bài viết",
      link: "/blogs",
    },
    {
      id: 5,
      name: "Giới thiệu",
      link: "/introduce",
    },
  ];
  return (
    <>
      <div>
        {/* <div className="preloader-wrapper">
          <div className="preloader"></div>
        </div> */}
        <div
          className="offcanvas offcanvas-end"
          data-bs-scroll="true"
          tabIndex={-1}
          id="offcanvasSearch"
          aria-labelledby="Search"
        >
          <div className="offcanvas-header justify-content-center">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>
          <div className="offcanvas-body">
            <div className="order-md-last">
              <h4 className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-primary">Tìm Kiếm</span>
              </h4>
              <form
                role="search"
                action="index.html"
                method="get"
                className="d-flex mt-3 gap-0"
              >
                <input
                  className="header_search form-control rounded-start rounded-0 bg-light"
                  type="email"
                  placeholder="Tìm kiếm sản phẩm...."
                  aria-label="What are you looking for?"
                />
                <button
                  className="btn btn-dark rounded-end rounded-0"
                  type="submit"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
        <header>
          <div className="container-fluid">
            <div className="row py-3 border-bottom">
              <div className="col-sm-4 col-lg-3 text-center text-sm-start">
                <div className="main-logo">
                  <Link to={"/"}>
                    <img src={logo} alt="logo" className="img-fluid" />
                  </Link>
                </div>
              </div>
              <div className="col-sm-6 offset-sm-2 offset-md-0 col-lg-5 d-none d-lg-block">
                <div className="search-bar row bg-light p-2 my-2 rounded-4">
                  <div className="col-11 col-md-11">
                    <form
                      id="search-form"
                      className="text-center"
                      action="index.html"
                      method="post"
                    >
                      <input
                        type="text"
                        className="header_search form-control border-0 bg-transparent"
                        placeholder="Tìm kiếm sản phẩm tại đây..."
                      />
                    </form>
                  </div>
                  <div className="col-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 7-7a7 7 0 0 1-7 7Z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="col-sm-8 col-lg-4 d-flex justify-content-end gap-5 align-items-center mt-4 mt-sm-0 justify-content-center justify-content-sm-end">
                <div className="support-box text-end d-none d-xl-block">
                  <span className="fs-6 text-muted">Hotline</span>
                  <h5 className="mb-0">0396180619</h5>
                </div>
                <ul className="d-flex justify-content-end list-unstyled m-0">
                  {iconNavbars.map((item, index) => (
                    <li
                      key={item.id}
                      className={`${index > 1 ? "d-md-none" : ""}`}
                    >
                      <Link
                        to={item.link}
                        className="rounded-circle bg-light p-2 mx-1"
                        style={{
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 23,
                          color: "black",
                        }}
                      >
                        {item.icon}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="cart text-end d-none d-lg-block">
                  <button className="border-0 bg-transparent d-flex flex-column gap-2 lh-1 text-end">
                    <span className="fs-6 text-muted">Xin chào</span>
                    <span className="cart-total fs-5 fw-bold">Nguyên Tùng</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="container-fluid">
            <div className="row py-3">
              <div className="d-flex  justify-content-center justify-content-sm-between align-items-center">
                <nav className="main-menu d-flex navbar navbar-expand-lg">
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar"
                    aria-controls="offcanvasNavbar"
                  >
                    <span className="navbar-toggler-icon" />
                  </button>
                  <div
                    className="offcanvas offcanvas-end"
                    tabIndex={-1}
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                  >
                    <div className="offcanvas-body">
                      <ul className="navbar-nav justify-content-end menu-list list-unstyled d-flex gap-md-3 mb-0">
                        {navbars.map((navbar) => {
                          const isActive = location.pathname === navbar.link;
                          return (
                            <li
                              key={navbar.id}
                              className={`nav-item ${isActive ? "active" : ""}`}
                            >
                              <Link to={navbar.link} className="nav-link">
                                {navbar.name}
                              </Link>
                            </li>
                          );
                        })}

                        <li className="nav-item dropdown">
                          <a
                            className="nav-link dropdown-toggle"
                            role="button"
                            id="pages"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Dịch vụ
                          </a>
                          <ul className="dropdown-menu" aria-labelledby="pages">
                            {services.map((service) => (
                              <li key={service.id}>
                                <Link
                                  to={service.link}
                                  className="dropdown-item"
                                >
                                  {service.nameService}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>

                        <li className="nav-item dropdown">
                          <a
                            className="nav-link dropdown-toggle"
                            role="button"
                            id="pages"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <img
                              className="flag"
                              src={i18n.language === "vi" ? VietNam : Anh}
                              alt=""
                            />
                          </a>
                          <ul className="dropdown-menu" aria-labelledby="pages">
                            {langues.map((langue) => (
                              <li key={langue.id}>
                                <button
                                  className="dropdown-item d-flex align-items-center gap-2"
                                  onClick={() =>
                                    handleChangeLanguage(
                                      langue.name === "Tiếng Việt" ? "vi" : "en"
                                    )
                                  }
                                >
                                  <img
                                    className="flagSmall"
                                    src={langue.flag}
                                    alt={langue.name}
                                  />
                                  <span className="name-langue">
                                    {langue.name}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
