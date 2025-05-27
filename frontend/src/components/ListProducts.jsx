import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaShippingFast } from "react-icons/fa";
import { FaArrowDownShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import { MdDeleteSweep } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Loading from "../components/Loading";
import Product from "./Product";
import "../assets/css/products.css";
import { fetchCategory } from "../slices/categorySlice";

// Hàm lọc theo danh mục
const filterByCategory = (products, selectedCategoryId) => {
  if (!selectedCategoryId) return products;
  return products.filter(
    (p) => String(p.category_id) === String(selectedCategoryId)
  );
};

// Hàm lọc theo giá
const filterByPrice = (products, priceFilter, parsePrice) => {
  if (priceFilter === "duoi-10tr") {
    return products.filter((p) => parsePrice(p.price) < 10000000);
  } else if (priceFilter === "10-20tr") {
    return products.filter(
      (p) => parsePrice(p.price) >= 10000000 && parsePrice(p.price) <= 20000000
    );
  } else if (priceFilter === "tren-20tr") {
    return products.filter((p) => parsePrice(p.price) > 20000000);
  }
  return products;
};

// Hàm lọc còn hàng
const filterByStock = (products, readyStock) => {
  if (!readyStock) return products;
  return products.filter((p) => p.stock > 0);
};

// Hàm tìm kiếm theo tên
const filterBySearch = (products, searchTerm) => {
  if (!searchTerm) return products;
  return products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Hàm sắp xếp
const sortProducts = (products, sortOrder, parsePrice) => {
  if (sortOrder === "lowToHigh") {
    return products
      .slice()
      .sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortOrder === "highToLow") {
    return products
      .slice()
      .sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  }
  return products;
};

export default function ListProducts({
  title,
  showHeader = true,
  padding,
  filter = true,
  limit,
  products,
  loading,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [priceFilter, setPriceFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [readyStock, setReadyStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { categorys } = useSelector((state) => state.categorys);

  const parsePrice = (priceStr) =>
    parseInt(priceStr?.replace(/[^\d]/g, "")) || 0;

  const getDiscountPercent = (product) => {
    const original = parsePrice(product.price_original);
    const sale = parsePrice(product.price);
    if (!original || !sale || sale >= original) return null;
    return Math.floor(((original - sale) / original) * 100);
  };

  useEffect(() => {
    dispatch(fetchCategory());
  }, [dispatch]);

  // Áp dụng các bộ lọc và tìm kiếm
  let filteredProducts = Array.isArray(products) ? products : [];
  filteredProducts = filterByCategory(filteredProducts, selectedCategoryId);
  filteredProducts = filterByPrice(filteredProducts, priceFilter, parsePrice);
  filteredProducts = filterByStock(filteredProducts, readyStock);
  filteredProducts = filterBySearch(filteredProducts, searchTerm);
  filteredProducts = sortProducts(filteredProducts, sortOrder, parsePrice);

  return (
    <section className={padding}>
      <div className="container-fluid">
        {filter && (
          <div className="filter-bar-wrapper">
            <div className="filter-extended">
              <div className="filter-group">
                <label>{t("products.search")}:</label>
                <input
                  type="text"
                  className="product_filter_listproduct form-control"
                  placeholder={t("products.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ minWidth: 180 }}
                />
              </div>
              <div className="filter-group">
                <label>{t("products.trademark")}:</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">{t("products.all")}</option>
                  {categorys?.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
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
              <button
                style={{
                  background: sortOrder === "lowToHigh" ? "#e40303" : "",
                  color: sortOrder === "lowToHigh" ? "#fff" : "",
                  border: sortOrder === "lowToHigh" ? "1px solid #e40303" : "",
                  marginRight: 8,
                }}
                onClick={() => setSortOrder("lowToHigh")}
              >
                <span>
                  <FaArrowUpWideShort />
                </span>
                {t("products.lowToHigh")}
              </button>
              <button
                style={{
                  background: sortOrder === "highToLow" ? "#e40303" : "",
                  color: sortOrder === "highToLow" ? "#fff" : "",
                  border: sortOrder === "highToLow" ? "1px solid #e40303" : "",
                  marginRight: 8,
                }}
                onClick={() => setSortOrder("highToLow")}
              >
                <span>
                  <FaArrowDownShortWide />
                </span>
                {t("products.highToLow")}
              </button>
              <button
                style={{
                  background: readyStock ? "#e40303" : "",
                  color: readyStock ? "#fff" : "",
                  border: readyStock ? "1px solid #e40303" : "",
                  marginRight: 8,
                }}
                onClick={() => setReadyStock((prev) => !prev)}
              >
                <span>
                  <FaShippingFast />
                </span>
                {t("products.readyStock")}
              </button>
              <button
                style={{
                  background: "#f0a600",
                  color: "#fff",
                }}
                onClick={() => {
                  setSelectedCategoryId("");
                  setPriceFilter("");
                  setSortOrder("");
                  setReadyStock(false);
                  setSearchTerm("");
                }}
              >
                <span>
                  <MdDeleteSweep style={{ fontSize: 20 }} />
                </span>
                {t("products.deleteFilter")}
              </button>
            </div>
          </div>
        )}
        <div className="row">
          {loading && <Loading />}
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
                  {filteredProducts.length === 0 ? (
                    <div
                      className="w-100 d-flex justify-content-center align-items-center"
                      style={{ minHeight: 200 }}
                    >
                      <h6 className="text-center  text-muted fw-bold">
                        {t("products.noProductFound")}
                      </h6>
                    </div>
                  ) : (
                    <div className="product-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                      {(limit
                        ? filteredProducts.slice(0, limit)
                        : filteredProducts
                      ).map((product) => {
                        const discountPercent = getDiscountPercent(product);
                        return (
                          <Product
                            key={product.product_id}
                            product={product}
                            discountPercent={discountPercent}
                            nextProductDetail={() =>
                              navigate(`/product-detail/${product.product_id}`)
                            }
                          />
                        );
                      })}
                    </div>
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
