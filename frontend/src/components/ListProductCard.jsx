import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "./ProductsCard";

export default function ListProductCard({ title, products }) {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);

  const convertPriceToNumber = (priceString) => {
    if (!priceString) return NaN;
    return Number(priceString.replace(/[^0-9.-]+/g, ""));
  };
  const getDiscountPercent = (product) => {
    const original = convertPriceToNumber(product.price_original);
    const sale = convertPriceToNumber(product.price);
    if (
      isNaN(original) ||
      isNaN(sale) ||
      sale >= original ||
      !original ||
      !sale
    )
      return null;
    return Math.floor(((original - sale) / original) * 100);
  };

  return (
    <section className="overflow-hidden">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="section-header d-flex flex-wrap justify-content-between my-5">
              <h2 className="section-title">{title}</h2>
              <div className="d-flex align-items-center">
                <Link
                  to={"/products"}
                  className="btn-link text-decoration-none"
                >
                  {t("home.goToShop")}
                </Link>
                <div className="swiper-buttons">
                  <button className="category-carousel-prev btn btn-primary">
                    ❮
                  </button>
                  <button className="category-carousel-next btn btn-primary">
                    ❯
                  </button>
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
              {products?.slice(0, 8).map((product) => {
                const discountPercent = getDiscountPercent(product);
                return (
                  <SwiperSlide key={product.product_id}>
                    <ProductCard
                      favorites={favorites}
                      setFavorites={setFavorites}
                      discountPercent={discountPercent}
                      product={product}
                    />
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
