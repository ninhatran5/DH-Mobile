import logo from "../assets/images/logo2.png";
import { RiUserLine } from "react-icons/ri";
import { CgSearch } from "react-icons/cg";
import { IoMdHeartEmpty } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import VietNam from "../assets/images/vietnam.png";
import Anh from "../assets/images/england.png";
import "../assets/css/header.css";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import { FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Header() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [searchItem, setSearchItem] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchResults([]);
    setSearchItem("");
  }, [location]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const { t } = useTranslation();

  const iconNavbars = [
    {
      id: 1,
      icon: <FiShoppingCart />,
      link: "/shopping-cart",
    },
    {
      id: 2,
      icon: <RiUserLine />,
      link: "/login",
    },
    {
      id: 3,
      icon: <IoMdHeartEmpty />,
      link: "/favorite-products",
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
      nameService: t("header.warrantyPolicy"),
      link: "/warranty-policy",
    },
    {
      id: 2,
      nameService: t("header.returnPolicy"),
      link: "/return-policy",
    },
    {
      id: 3,
      nameService: t("header.deliveryPolicy"),
      link: "/delivery-policy",
    },
    {
      id: 4,
      nameService: t("header.checkImei"),
      link: "/check-imei",
    },
  ];
  const languages = [
    {
      id: 1,
      name: t("header.en"),
      code: "en",
      flag: Anh,
    },
    {
      id: 2,
      name: t("header.vi"),
      code: "vi",
      flag: VietNam,
    },
  ];
  const navbars = [
    {
      id: 1,
      name: t("header.home"),
      link: "/",
    },
    {
      id: 2,
      name: t("header.products"),
      link: "/products",
    },
    {
      id: 3,
      name: t("header.voucher"),
      link: "/vouchers",
    },
    {
      id: 4,
      name: t("header.blog"),
      link: "/blogs",
    },
    {
      id: 5,
      name: t("header.introduce"),
      link: "/introduce",
    },
  ];
  const products = [
    {
      id: 1,
      name: "iPhone 16 Pro Max 256GB | Chính hãng VN/A",
      price: "27.890.000đ",
      image: iphone,
    },
    {
      id: 2,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 3,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 4,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 5,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 6,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 7,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 8,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 9,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      id: 10,
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
  ];

  const changeInputSearch = (event) => {
    const value = event.target.value;
    setSearchItem(value);

    if (value.trim()) {
      const results = products.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = () => {
    if (!searchItem.trim()) {
      setSearchResults([]);
      return;
    }
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(searchItem.toLowerCase())
    );
    setSearchResults(results);
    setSearchItem("");
  };

  const handleEnterSearch = (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleNextProductDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };
  return (
    <>
      <div>
        {/* <div className="preloader-wrapper">
          <div className="preloader"></div>
        </div> */}
        <header className={searchResults.length > 0 ? "position-fixed w-100 bg-white" : ""} style={searchResults.length > 0 ? { top: 0, left: 0, zIndex: 1000 } : {}}>
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
                      method="post"
                    >
                      <input
                        type="text"
                        value={searchItem}
                        onKeyDown={handleEnterSearch}
                        onChange={changeInputSearch}
                        className="header_search form-control border-0 bg-transparent"
                        placeholder={t("header.search")}
                      />
                    </form>
                  </div>
                  <div
                    onClick={handleSearch}
                    className="col-2 col-md-1 d-flex align-items-center justify-content-center"
                    style={{ cursor: "pointer" }}
                  >
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
                <div className="support-box text-end d-none d-xxl-block">
                  <span className="fs-6 text-muted">Hotline</span>
                  <h5 className="mb-0">0396180619</h5>
                </div>
                <ul className="d-flex justify-content-end list-unstyled m-0">
                  {iconNavbars.map((item, index) => (
                    <li
                      key={item.id}
                      className={`${index > 1 ? "d-lg-none" : ""}`}
                    >
                      {item.id === 4 ? (
                        <a
                          href="#"
                          className="rounded-circle bg-light p-2 mx-1 d-lg-none"
                          data-bs-toggle="offcanvas"
                          data-bs-target="#offcanvasSearch"
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
                        </a>
                      ) : (
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
                      )}
                    </li>
                  ))}

                  <li className="d-xxl-none"></li>
                </ul>

                <div className="cart text-end d-none d-lg-block">
                  <button className="border-0 bg-transparent d-flex flex-column gap-2 lh-1 text-end">
                    <span className="fs-6 text-muted">{t("header.hello")}</span>
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
                            {t("header.service")}
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
                            {languages.map((language) => (
                              <li key={language.id}>
                                <button
                                  className="dropdown-item d-flex align-items-center gap-2"
                                  onClick={() =>
                                    changeLanguage(
                                      language.code === "vi" ? "vi" : "en"
                                    )
                                  }
                                >
                                  <img
                                    className="flagSmall"
                                    src={language.flag}
                                    alt={language.name}
                                  />
                                  <span className="name-langue">
                                    {language.name}
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
        {searchResults.length > 0 && <div style={{ height: "180px" }}></div>}
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
                <span className="text-primary">{t("header.searchIcon")}</span>
              </h4>
              <form
                role="search"
                className="d-flex mt-3 gap-0"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <input
                  className="header_search form-control rounded-start rounded-0 bg-light"
                  type="text"
                  value={searchItem}
                  onChange={changeInputSearch}
                  onKeyDown={handleEnterSearch}
                  placeholder={t("header.search")}
                />
                <button
                  className="btn btn-dark rounded-end rounded-0"
                  type="submit"
                >
                  Search
                </button>
              </form>
              {/* Show search results in offcanvas */}
              {searchResults.length > 0 && (
                <ul className="search-results list-group mt-3">
                  {searchResults.map((product) => (
                    <li
                      key={product.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setSearchResults([]);
                        setSearchItem("");
                        handleNextProductDetail(product.id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <div className="fw-bold">{product.name}</div>
                          <div style={{ color: "#e74c3c" }} className="fw-bold">
                            {product.price}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {searchItem.trim() !== "" && searchResults.length === 0 && (
                <div className="no-results mt-3 p-2">
                  Không tìm thấy sản phẩm
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Desktop search results */}
      {searchResults.length > 0 && (
        <div
          className="search-results position-fixed bg-white border rounded w-100 d-none d-lg-block p-3"
          style={{ 
            height: "calc(100vh - 180px)", 
            top: "180px",
            left: 0,
            overflowY: "auto", 
            zIndex: 999
          }}
        >
          <div className="container-fluid">
            <div className="product-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
              {searchResults.map((product) => (
                <div className="col" key={product.id}>
                  <div className="product-item">
                    <a
                      onClick={() => {
                        toast.success(t("products.addedToFavorites"));
                      }}
                      style={{ cursor: "pointer" }}
                      className="btn-wishlist"
                    >
                      <FaRegHeart style={{ fontSize: 20 }} />
                    </a>
                    <figure>
                      <Link
                        to={`/product-detail/${product.id}`}
                        title={product.name}
                      >
                        <img src={product.image} className="tab-image" />
                      </Link>
                    </figure>
                    <h3>
                      <Link
                        to={`/product-detail/${product.id}`}
                        onClick={() => {
                          setSearchResults([]);
                          setSearchItem("");
                        }}
                        style={{
                          cursor: "pointer",
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <span className="price">{product.price}</span>
                    <div className="d-flex align-items-center justify-content-between">
                      <a
                        onClick={() => {
                          toast.success(t("products.addedToCart"));
                          setSearchResults([]);
                          setSearchItem("");
                          navigate('/shopping-cart')
                        }}
                        style={{ cursor: "pointer" }}
                        className="nav-link"
                      >
                        {t("products.addToCart")}
                        <iconify-icon icon="uil:shopping-cart" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {searchItem.trim() !== "" && searchResults.length === 0 && (
        <div
          className="no-results position-fixed bg-white border rounded w-100 p-2 d-none d-lg-block"
          style={{ 
            height: "calc(100vh - 180px)", 
            top: "180px",
            left: 0,
            overflowY: "auto", 
            zIndex: 999
          }}
        >
          <div className="container-fluid">
            <div className="text-center mt-5">
              <img
                src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/a60759ad1dabe909c46a817ecbf71878.png"
                alt="No results"
                style={{ width: "100px" }}
              />
              <h4 className="mt-4">{t("products.noProductFound")}</h4>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
