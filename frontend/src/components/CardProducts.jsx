import { useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import iphone16 from "../assets/images/aaa.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function CardProduct({ title }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const products = [
    { id: 1, title: "Sunstar Fresh Melon Juice", price: "$18.00", image: iphone16 },
    { id: 2, title: "iPhone 16 Pro Max", price: "$1,199.00", priceOriginal: "$1,499.00", image: iphone16 },
    { id: 3, title: "iPhone 16 Mini", price: "$799.00", image: iphone16 },
    { id: 4, title: "iPhone 16 Ultra", price: "$1,399.00", image: iphone16 },
    { id: 5, title: "iPhone 16 SE", price: "$699.00", image: iphone16 },
    { id: 6, title: "iPhone 16 Plus", price: "$999.00", priceOriginal: "$1,199.00", image: iphone16 },
    { id: 7, title: "iPhone 16 Pro", price: "$1,199.00", image: iphone16 },
    { id: 8, title: "iPhone 16 Max", price: "$1,499.00", image: iphone16 },
    { id: 9, title: "iPhone 16 Mini Pro", price: "$899.00", priceOriginal: "$1,099.00", image: iphone16 },
    { id: 10, title: "iPhone 16 Ultra Max", price: "$1,599.00", priceOriginal: "$1,899.00", image: iphone16 },
  ];

  // State lưu danh sách id sản phẩm đã yêu thích
  const [favorites, setFavorites] = useState([]);

  // Chuyển giá dạng string "$1,199.00" thành số 1199
  const convertPriceToNumber = (priceString) => {
    if (!priceString) return NaN;
    return Number(priceString.replace(/[^0-9.-]+/g, ""));
  };

  // Tính phần trăm giảm giá nếu có
  const getDiscountPercent = (product) => {
    if (!product.price || !product.priceOriginal) return null;

    const original = convertPriceToNumber(product.priceOriginal);
    const sale = convertPriceToNumber(product.price);

    if (isNaN(original) || isNaN(sale) || sale >= original) return null;

    return Math.round(((original - sale) / original) * 100);
  };

  // Xử lý thêm vào yêu thích (toggle)
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        toast.info(t("products.removeFavorites"));
        return prev.filter((fid) => fid !== id);
      } else {
        toast.success(t("products.addedToFavorites"));
        return [...prev, id];
      }
    });
  };

  const nextProductDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const addToShoppingCart = () => {
    toast.success(t("products.addedToCart"));
    navigate("/shopping-cart");
  };

  return (
    <section className="overflow-hidden">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="section-header d-flex flex-wrap justify-content-between my-5">
              <h2 className="section-title">{title}</h2>
              <div className="d-flex align-items-center">
                <Link to={"/products"} className="btn-link text-decoration-none">
                  {t("home.goToShop")}
                </Link>
                <div className="swiper-buttons">
                  <button className="category-carousel-prev btn btn-primary">❮</button>
                  <button className="category-carousel-next btn btn-primary">❯</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              navigation={{
                nextEl: ".category-carousel-next",
                prevEl: ".category-carousel-prev",
              }}
              speed={600}
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
                1200: { slidesPerView: 5 },
              }}
            >
              {products.map((product) => {
                const discountPercent = getDiscountPercent(product);
                const isFavorite = favorites.includes(product.id);

                return (
                  <SwiperSlide key={product.id}>
                    <div className="product-item position-relative">
                      {/* Badge % giảm giá */}
                      {discountPercent !== null && (
                        <span className="badge bg-success position-absolute mt-1 ms-1">
                          -{discountPercent}%
                        </span>
                      )}

                      {/* Nút yêu thích toggle */}
                      <a
                        style={{ cursor: "pointer" }}
                        className="btn-wishlist"
                        onClick={() => toggleFavorite(product.id)}
                        title={isFavorite ? t("products.removeFavorites") : t("products.addedToFavorites")}
                      >
                        {isFavorite ? (
                          <FaHeart style={{ color: "red", fontSize: 20 }} />
                        ) : (
                          <FaRegHeart style={{ fontSize: 20 }} />
                        )}
                      </a>

                      <figure>
                        <a title={product.title}>
                          <img
                            style={{ cursor: "pointer" }}
                            onClick={() => nextProductDetail(product.id)}
                            src={product.image}
                            className="tab-image"
                            alt={product.title}
                          />
                        </a>
                      </figure>

                      <h3
                        style={{ cursor: "pointer" }}
                        onClick={() => nextProductDetail(product.id)}
                      >
                        {product.title}
                      </h3>

                      <div className="price_products_sale">
                        <span className="price">{product.price}</span>
                        <span className="price_original">{product.priceOriginal}</span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <a
                          style={{ cursor: "pointer" }}
                          onClick={addToShoppingCart}
                          className="nav-link"
                        >
                          {t("products.addToCart")}
                        </a>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
