import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import iphone16 from "../assets/images/aaa.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "./ProductsCard";

export default function ListProductCard({ title }) {
  const { t } = useTranslation();

  const products = [
  {
    id: 1,
    title: "Sunstar Fresh Melon Juice",
    price: "$18.00",
    image: iphone16,
    favorite: false,
  },
  {
    id: 2,
    title: "iPhone 16 Pro Max",
    price: "$1,199.00",
    priceOriginal: "$1,499.00",
    image: iphone16,
    favorite: true,
  },
  { id: 3, title: "iPhone 16 Mini", price: "$799.00", image: iphone16, favorite: false },
  { id: 4, title: "iPhone 16 Ultra", price: "$1,399.00", image: iphone16, favorite: false },
  { id: 5, title: "iPhone 16 SE", price: "$699.00", image: iphone16, favorite: false },
  {
    id: 6,
    title: "iPhone 16 Plus",
    price: "$999.00",
    priceOriginal: "$1,199.00",
    image: iphone16,
    favorite: true,
  },
  { id: 7, title: "iPhone 16 Pro", price: "$1,199.00", image: iphone16, favorite: false },
  { id: 8, title: "iPhone 16 Max", price: "$1,499.00", image: iphone16, favorite: false },
  {
    id: 9,
    title: "iPhone 16 Mini Pro",
    price: "$899.00",
    priceOriginal: "$1,099.00",
    image: iphone16,
    favorite: false,
  },
  {
    id: 10,
    title: "iPhone 16 Ultra Max",
    price: "$1,599.00",
    priceOriginal: "$1,899.00",
    image: iphone16,
    favorite: false,
  },
];


  const [favorites, setFavorites] = useState([]);

  const convertPriceToNumber = (priceString) => {
    if (!priceString) return NaN;
    return Number(priceString.replace(/[^0-9.-]+/g, ""));
  };

  const getDiscountPercent = (product) => {
    if (!product.price || !product.priceOriginal) return null;

    const original = convertPriceToNumber(product.priceOriginal);
    const sale = convertPriceToNumber(product.price);

    if (isNaN(original) || isNaN(sale) || sale >= original) return null;

    return Math.round(((original - sale) / original) * 100);
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
              {products.map((product) => {
                const discountPercent = getDiscountPercent(product);

                return (
                  <SwiperSlide key={product.id}>
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
