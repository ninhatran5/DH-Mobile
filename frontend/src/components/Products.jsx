import { useState } from "react";
import { FaRegHeart, FaShippingFast } from "react-icons/fa";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowDownShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import { LuHeartOff } from "react-icons/lu";

import "../assets/css/products.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function Products({
  title,
  showHeader = true,
  padding,
  filter = true,
  unfavorite = true,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [priceFilter, setPriceFilter] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // '' | 'lowToHigh' | 'highToLow'

  const nextProductDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const addToFavorites = () => {
    console.log("added");
    toast.success(t("products.addedToFavorites"));
  };

  const handleUnFavorites = () => {
    console.log("un");
    toast.success(t("products.removeFavorites"));
  };

  const addToShoppingCart = () => {
    console.log("added");
    toast.success(t("products.addedToCart"));
    navigate("/shopping-cart");
  };

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
      name: "Xiaomi Redmi Note 12",
      price: "6.990.000đ",
      image: iphone,
    },
    {
      id: 4,
      name: "iPhone 15 Pro Max",
      price: "34.990.000đ",
      image: iphone,
    },
    {
      id: 5,
      name: "Samsung Galaxy A14",
      price: "4.690.000đ",
      image: iphone,
    },
    {
      id: 6,
      name: "iPhone SE 2022",
      price: "9.990.000đ",
      image: iphone,
    },
    {
      id: 7,
      name: "Xiaomi 13T Pro",
      price: "13.990.000đ",
      image: iphone,
    },
    {
      id: 8,
      name: "Samsung Galaxy S21 FE",
      price: "12.490.000đ",
      image: iphone,
    },
    {
      id: 9,
      name: "iPhone 14 128GB",
      price: "19.990.000đ",
      image: iphone,
    },
    {
      id: 10,
      name: "iPhone 11 64GB",
      price: "10.490.000đ",
      image: iphone,
    },
  ];

  // Chuyển chuỗi giá thành số nguyên
  const parsePrice = (priceStr) => parseInt(priceStr.replace(/[^\d]/g, ""));

  // Lọc theo giá
  const filteredProducts = products.filter((product) => {
    const price = parsePrice(product.price);
    if (priceFilter === "duoi-10tr") return price < 10000000;
    if (priceFilter === "10-20tr")
      return price >= 10000000 && price <= 20000000;
    if (priceFilter === "tren-20tr") return price > 20000000;
    return true;
  });

  // Sắp xếp theo giá
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parsePrice(a.price);
    const priceB = parsePrice(b.price);

    if (sortOrder === "lowToHigh") return priceA - priceB;
    if (sortOrder === "highToLow") return priceB - priceA;
    return 0;
  });

  return (
    <section className={padding}>
      <div className="container-fluid">
        {filter && (
          <div className="filter-bar-wrapper">
            <div className="filter-extended">
              <div className="filter-group">
                <label>{t("products.trademark")}:</label>
                <select>
                  <option value="">{t("products.all")}</option>
                  <option value="iphone">iPhone</option>
                  <option value="samsung">Samsung</option>
                  <option value="xiaomi">Xiaomi</option>
                </select>
              </div>
              <div className="filter-group">
                <label>{t("products.price")}:</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="">{t("products.all")}</option>
                  <option value="duoi-10tr">{t("products.duoi10tr")}</option>
                  <option value="10-20tr">{t("products.10-20trieu")}</option>
                  <option value="tren-20tr">{t("products.tren20trieu")}</option>
                </select>
              </div>
            </div>
            <div className="filter-buttons">
              <button onClick={() => setSortOrder("lowToHigh")}>
                <span>
                  <FaArrowUpWideShort />
                </span>
                {t("products.lowToHigh")}
              </button>
              <button onClick={() => setSortOrder("highToLow")}>
                <span>
                  <FaArrowDownShortWide />
                </span>
                {t("products.highToLow")}
              </button>
              <button>
                <span>
                  <FaShippingFast />
                </span>
                {t("products.readyStock")}
              </button>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-12">
            <div className="bootstrap-tabs product-tabs">
              {showHeader && (
                <div className="tabs-header d-flex justify-content-between border-bottom my-5">
                  <h3>{title}</h3>
                  <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                      <Link
                        to={"/products"}
                        className="nav-link text-uppercase fs-6 active"
                      >
                        {t("home.goToShop")}
                      </Link>
                    </div>
                  </nav>
                </div>
              )}
              <div className="tab-content" id="nav-tabContent">
                <div
                  className="tab-pane fade show active"
                  id="nav-all"
                  role="tabpanel"
                  aria-labelledby="nav-all-tab"
                >
                  <div className="product-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                    {sortedProducts.map((product) => (
                      <div className="col" key={product.id}>
                        <div className="product-item">
                          {unfavorite ? (
                            <a
                              onClick={addToFavorites}
                              style={{ cursor: "pointer" }}
                              className="btn-wishlist"
                            >
                              <FaRegHeart style={{ fontSize: 20 }} />
                            </a>
                          ) : (
                            <a
                              onClick={handleUnFavorites}
                              style={{ cursor: "pointer" }}
                              className="btn-wishlist"
                            >
                              <LuHeartOff style={{ fontSize: 20 }} />
                            </a>
                          )}

                          <figure>
                            <Link
                              to={`/product-detail/${product.id}`}
                              title={product.name}
                            >
                              <img src={product.image} className="tab-image" />
                            </Link>
                          </figure>
                          <h3
                            onClick={() => nextProductDetail(product.id)}
                            style={{ cursor: "pointer" }}
                          >
                            {product.name}
                          </h3>
                          <span className="price">{product.price}</span>
                          <div className="d-flex align-items-center justify-content-between">
                            <a
                              onClick={addToShoppingCart}
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
                  {sortedProducts.length === 0 && (
                    <p className="text-center mt-5">
                      {t("products.noProductFound")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
