import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaShippingFast } from "react-icons/fa";
import {
  FaArrowDownShortWide,
  FaArrowUpWideShort,
  FaFilter,
} from "react-icons/fa6";
import { MdDeleteSweep } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Loading from "../components/Loading";
import Product from "./Product";
import "../assets/css/products.css";
import { fetchCategory } from "../slices/categorySlice";
import Pagination from "../components/Pagination";
import { addViewProducts } from "../slices/viewProductSlice";

// Filter helpers
const filterByCategory = (products, selectedCategoryId) =>
  !selectedCategoryId
    ? products
    : products.filter(
        (p) => String(p.category_id) === String(selectedCategoryId)
      );

const filterByPrice = (products, priceFilter, parsePrice) => {
  if (priceFilter === "duoi-10tr")
    return products.filter((p) => parsePrice(p.price) < 10000000);
  if (priceFilter === "10-20tr")
    return products.filter((p) => {
      const price = parsePrice(p.price);
      return price >= 10000000 && price <= 20000000;
    });
  if (priceFilter === "tren-20tr")
    return products.filter((p) => parsePrice(p.price) > 20000000);
  return products;
};

const filterByStock = (products, readyStock, productsVariant) =>
  !readyStock
    ? products
    : products.filter((p) => {
        const variants = productsVariant?.filter(
          (v) => String(v.product_id) === String(p.product_id)
        );
        return (
          variants &&
          variants.length > 0 &&
          variants.some((v) => (v.stock ?? 0) > 0)
        );
      });

const filterBySearch = (products, searchTerm) =>
  !searchTerm
    ? products
    : products.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

const sortProducts = (products, sortOrder, parsePrice) => {
  if (sortOrder === "lowToHigh")
    return products
      .slice()
      .sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  if (sortOrder === "highToLow")
    return products
      .slice()
      .sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  return products;
};

const filterVariants = (variants, memory, ram, color) =>
  variants.filter((variant) => {
    let match = true;

    if (memory)
      match =
        match &&
        variant.attributes.some(
          (attr) =>
            attr.name &&
            attr.values &&
            ["storage", "bộ nhớ"].includes(attr.name.toLowerCase()) &&
            attr.values.some(
              (val) =>
                val.value &&
                String(val.value).replace("GB", "") === String(memory)
            )
        );

    if (ram)
      match =
        match &&
        variant.attributes.some(
          (attr) =>
            attr.name &&
            attr.values &&
            ["ram"].includes(attr.name.toLowerCase()) &&
            attr.values.some(
              (val) =>
                val.value && String(val.value).replace("GB", "") === String(ram)
            )
        );

    if (color)
      match =
        match &&
        variant.attributes.some(
          (attr) =>
            attr.name &&
            attr.values &&
            ["color", "màu sắc"].includes(attr.name.toLowerCase()) &&
            attr.values.some(
              (val) =>
                val.value && val.value.toLowerCase() === color.toLowerCase()
            )
        );

    return match;
  });

export default function ListProducts({
  title,
  showHeader = true,
  padding,
  filter = true,
  limit,
  products,
  loading,
  productsVariant,
  showPagination = true,
  productsPerPage = 15,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { viewProducts: _ } = useSelector((state) => state.viewProduct);
  const userId = localStorage.getItem("userID");

  // Filter states
  const [priceFilter, setPriceFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [readyStock, setReadyStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [memoryFilter, setMemoryFilter] = useState("");
  const [ramFilter, setRamFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Scroll to top when page/filter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    memoryFilter,
    ramFilter,
    colorFilter,
    priceFilter,
    sortOrder,
    selectedCategoryId,
    readyStock,
    searchTerm,
  ]);

  // Options
  const ramOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (productsVariant || []).flatMap((variant) =>
            (variant.attributes || [])
              .filter(
                (attr) =>
                  attr.name &&
                  attr.values &&
                  ["ram"].includes(attr.name.toLowerCase())
              )
              .flatMap((attr) =>
                attr.values
                  .filter((val) => val.value)
                  .map((val) => val.value.replace("GB", ""))
              )
          )
        )
      ),
    [productsVariant]
  );

  const memoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (productsVariant || []).flatMap((variant) =>
            (variant.attributes || [])
              .filter(
                (attr) =>
                  attr.name &&
                  attr.values &&
                  ["storage", "bộ nhớ"].includes(attr.name.toLowerCase())
              )
              .flatMap((attr) =>
                attr.values
                  .filter((val) => val.value)
                  .map((val) => val.value.replace("GB", ""))
              )
          )
        )
      ),
    [productsVariant]
  );

  const colorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (productsVariant || []).flatMap((variant) =>
            (variant.attributes || [])
              .filter(
                (attr) =>
                  attr.name &&
                  attr.values &&
                  ["color", "màu sắc"].includes(attr.name.toLowerCase())
              )
              .flatMap((attr) =>
                attr.values.filter((val) => val.value).map((val) => val.value)
              )
          )
        )
      ),
    [productsVariant]
  );

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? products : [];
    // Filter by variant
    if (memoryFilter || ramFilter || colorFilter) {
      const filteredVariants = filterVariants(
        productsVariant || [],
        memoryFilter,
        ramFilter,
        colorFilter
      );
      const filteredProductIds = [
        ...new Set(filteredVariants.map((v) => v.product_id)),
      ];
      filtered = filtered.filter((p) =>
        filteredProductIds.includes(p.product_id)
      );
    }
    filtered = filterByCategory(filtered, selectedCategoryId);
    filtered = filterByPrice(filtered, priceFilter, parsePrice);
    filtered = filterByStock(filtered, readyStock, productsVariant);
    filtered = filterBySearch(filtered, searchTerm);
    filtered = sortProducts(filtered, sortOrder, parsePrice);
    return filtered;
  }, [
    products,
    productsVariant,
    memoryFilter,
    ramFilter,
    colorFilter,
    selectedCategoryId,
    priceFilter,
    readyStock,
    searchTerm,
    sortOrder,
  ]);

  // Limit products if needed
  const limitedProducts = useMemo(() => {
    if (limit && Number.isInteger(limit) && limit > 0) {
      return filteredProducts.slice(0, limit);
    }
    return filteredProducts;
  }, [filteredProducts, limit]);

  // Pagination
  const totalPages = Math.ceil(limitedProducts.length / productsPerPage);
  const paginatedProducts = useMemo(
    () =>
      limitedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
      ),
    [limitedProducts, currentPage, productsPerPage]
  );

  return (
    <>
      <section className={padding}>
        <div className="container-fluid">
          {filter && (
            <>
              <div className="d-flex justify-content-end mb-3">
                <button
                  className={`btn-filter${showFilters ? " active" : ""}`}
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <span>
                    <FaFilter />
                  </span>
                  {t("products.filter")}
                </button>
              </div>
              {showFilters && (
                <div className="filter-bar-wrapper show">
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
                        <option value="duoi-10tr">
                          {t("products.duoi10tr")}
                        </option>
                        <option value="10-20tr">
                          {t("products.10-20trieu")}
                        </option>
                        <option value="tren-20tr">
                          {t("products.tren20trieu")}
                        </option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>{t("products.storage")}:</label>
                      <select
                        value={memoryFilter}
                        onChange={(e) => setMemoryFilter(e.target.value)}
                      >
                        <option value="">{t("products.all")}</option>
                        {memoryOptions.map((mem) => (
                          <option key={mem} value={mem}>
                            {mem}GB
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>RAM:</label>
                      <select
                        value={ramFilter}
                        onChange={(e) => setRamFilter(e.target.value)}
                      >
                        <option value="">{t("products.all")}</option>
                        {ramOptions.map((ram) => (
                          <option key={ram} value={ram}>
                            {ram}GB
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>{t("products.color")}:</label>
                      <select
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                      >
                        <option value="">{t("products.all")}</option>
                        {colorOptions.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="filter-buttons">
                    <button
                      style={{
                        background: sortOrder === "lowToHigh" ? "#e40303" : "",
                        color: sortOrder === "lowToHigh" ? "#fff" : "",
                        border:
                          sortOrder === "lowToHigh" ? "1px solid #e40303" : "",
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
                        border:
                          sortOrder === "highToLow" ? "1px solid #e40303" : "",
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
                        setMemoryFilter("");
                        setRamFilter("");
                        setColorFilter("");
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
              {!showFilters && <div className="filter-bar-wrapper"></div>}
            </>
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
                    {paginatedProducts.length === 0 ? (
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
                        {paginatedProducts.map((product) => {
                          const discountPercent = getDiscountPercent(product);
                          return (
                            <Product
                              key={product.product_id}
                              product={product}
                              discountPercent={discountPercent}
                              onClick={() => {
                                dispatch(
                                  addViewProducts(product.product_id, userId)
                                );
                                navigate(
                                  `/product-detail/${product.product_id}`
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                    {/* PHÂN TRANG */}
                    {showPagination && totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
