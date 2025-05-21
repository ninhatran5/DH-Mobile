import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaShippingFast } from "react-icons/fa";
import { FaArrowDownShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import { MdDeleteSweep } from "react-icons/md";

import { useTranslation } from "react-i18next";

import Loading from "../components/Loading";
import Product from "./Product";

import "../assets/css/products.css";

import { fetchProducts } from "../slices/productSlice";
import { fetchProductVariants } from "../slices/productVariantsSlice";
import { fetchCategory } from "../slices/categorySlice";

export default function ListProducts({
  title,
  showHeader = true,
  padding,
  filter = true,
  limit,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [priceFilter, setPriceFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [readyStock, setReadyStock] = useState(false);
  const { products, loading } = useSelector((state) => state.product);
  const { productsVariants } = useSelector((state) => state.productsVariant);

  const { categorys } = useSelector((state) => state.category);

  const parsePrice = (priceStr) =>
    parseInt(priceStr?.replace(/[^\d]/g, "")) || 0;

  const getDiscountPercent = (product) => {
    const original = parsePrice(product.priceOriginal);
    const sale = parsePrice(product.price);
    if (sale >= original || !original || !sale) return null;
    return Math.round(((original - sale) / original) * 100);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = parsePrice(product.price);

      const matchCategory =
        !selectedCategoryId ||
        product.category_id?.toString() === selectedCategoryId;

      const matchPrice =
        (priceFilter === "duoi-10tr" && price < 10000000) ||
        (priceFilter === "10-20tr" && price >= 10000000 && price <= 20000000) ||
        (priceFilter === "tren-20tr" && price > 20000000) ||
        priceFilter === "" ||
        !priceFilter;

      const matchReadyStock = !readyStock || product.isReadyStock;

      return matchCategory && matchPrice && matchReadyStock;
    });
  }, [products, priceFilter, selectedCategoryId, readyStock]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      // Lấy variant tương ứng với từng sản phẩm
      const variantA = productsVariants.find(
        (variant) => variant.product_id === a.product_id
      );
      const variantB = productsVariants.find(
        (variant) => variant.product_id === b.product_id
      );
      // Ưu tiên lấy giá từ variant, nếu không có thì lấy từ product
      const priceA = parsePrice(variantA?.price ?? a.price);
      const priceB = parsePrice(variantB?.price ?? b.price);
      if (sortOrder === "lowToHigh") return priceA - priceB;
      if (sortOrder === "highToLow") return priceB - priceA;
      return 0;
    });
  }, [filteredProducts, sortOrder, productsVariants]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductVariants());
    dispatch(fetchCategory());
  }, [dispatch]);

  return (
    <section className={padding}>
      <div className="container-fluid">
        {filter && (
          <div className="filter-bar-wrapper">
            <div className="filter-extended">
              <div className="filter-group">
                <label>{t("products.trademark")}:</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">{t("products.all")}</option>
                  {categorys.map((category) => (
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
                onClick={() => setSortOrder("lowToHigh")}
                style={{
                  background: sortOrder === "lowToHigh" ? "#e40303" : "",
                  color: sortOrder === "lowToHigh" ? "#fff" : "",
                  border: sortOrder === "lowToHigh" ? "1px solid #e40303" : "",
                  marginRight: 8,
                }}
              >
                <span>
                  <FaArrowUpWideShort />
                </span>
                {t("products.lowToHigh")}
              </button>
              <button
                onClick={() => setSortOrder("highToLow")}
                style={{
                  background: sortOrder === "highToLow" ? "#e40303" : "",
                  color: sortOrder === "highToLow" ? "#fff" : "",
                  border: sortOrder === "highToLow" ? "1px solid #e40303" : "",
                  marginRight: 8,
                }}
              >
                <span>
                  <FaArrowDownShortWide />
                </span>
                {t("products.highToLow")}
              </button>
              <button
                onClick={() => setReadyStock((prev) => !prev)}
                style={{
                  background: readyStock ? "#e40303" : "",
                  color: readyStock ? "#fff" : "",
                  border: readyStock ? "1px solid #e40303" : "",
                  marginRight: 8,
                }}
              >
                <span>
                  <FaShippingFast />
                </span>
                {t("products.readyStock")}
              </button>
              <button
                onClick={() => {
                  setSelectedCategoryId("");
                  setPriceFilter("");
                  setSortOrder("");
                  setReadyStock(false);
                }}
                style={{
                  background: "#e80000",
                  color: "#fff",
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

        {loading && <Loading />}

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
                    {(limit
                      ? sortedProducts.slice(0, limit)
                      : sortedProducts
                    ).map((product) => {
                      const discountPercent = getDiscountPercent(product);
                      const matchedVariant = productsVariants.find(
                        (variant) => variant.product_id === product.product_id
                      );
                      return (
                        <Product
                          key={product.product_id}
                          product={product}
                          discountPercent={discountPercent}
                          productsVariants={matchedVariant}
                          nextProductDetail={() =>
                            navigate(`/product-detail/${product.product_id}`)
                          }
                        />
                      );
                    })}
                  </div>

                  {sortedProducts.length === 0 && (
                    <h6 className="text-center mt-5 mb-5">
                      {t("products.noProductFound")}
                    </h6>
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
