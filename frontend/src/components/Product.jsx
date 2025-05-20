import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import checkLogin from "../../utils/checkLogin";

const Product = ({ product, discountPercent, nextProductDetail }) => {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(product.favorite);
  const navigate = useNavigate();
  const handleUnFavorites = () => {
    console.log("un");
    setFavorite(false);
    toast.success(t("products.removeFavorites"));
  };
  const addToFavorites = () => {
    if (checkLogin()) {
      setFavorite(true);
      toast.success(t("products.addedToFavorites"));
    }
  };
  const addToShoppingCart = () => {
    if (checkLogin()) {
      console.log("added");
      toast.success(t("products.addedToCart"));
      navigate("/shopping-cart");
    }
  };
  return (
    <>
      <div className="col" key={product.id}>
        <div className="product-item position-relative">
          {discountPercent !== null && (
            <span className="badge bg-success position-absolute mt-1 ms-1">
              -{discountPercent}%
            </span>
          )}

          {!favorite ? (
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
              style={{
                cursor: "pointer",
                background: "#e70303",
                border: "1px solid #e70303",
                color: "white",
              }}
              className="btn-wishlist"
            >
              <FaRegHeart style={{ fontSize: 20 }} />
            </a>
          )}

          <figure>
            <Link to={`/product-detail/${product.id}`} title={product.name}>
              <img src={product.image} className="tab-image" />
            </Link>
          </figure>

          <h3
            onClick={() => nextProductDetail(product.id)}
            style={{ cursor: "pointer" }}
          >
            {product.name}
          </h3>

          {/* Giá */}
          <div
            className="price_products_sale"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
            }}
          >
            <span
              className="price"
              style={{
                color: "#e40303",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.price}
            </span>
            <span
              className="price_original"
              style={{
                color: "#e40303",
                fontSize: 13,
                textDecoration: "line-through",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.priceOriginal}
            </span>
          </div>

          {/* Thêm vào giỏ */}
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
    </>
  );
};
export default Product;
