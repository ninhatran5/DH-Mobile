import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProductCard = ({ discountPercent, product, nextProductDetail }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [favorite, setFavorite] = useState(product.favorite);

  const handleUnFavorites = () => {
    setFavorite(false);
    toast.success(t("products.removeFavorites"));
  };

  const addToFavorites = () => {
    setFavorite(true);
    toast.success(t("products.addedToFavorites"));
  };

  const addToShoppingCart = () => {
    toast.success(t("products.addedToCart"));
    navigate("/shopping-cart");
  };

  return (
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
          title={t("products.addedToFavorites")}
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
          title={t("products.removeFavorites")}
        >
          <FaRegHeart style={{ fontSize: 20 }} />
        </a>
      )}

      <figure>
        <img
          style={{ cursor: "pointer" }}
          onClick={() => nextProductDetail(product.id)}
          src={product.image}
          className="tab-image"
          alt={product.title || product.name}
          title={product.title || product.name}
        />
      </figure>

      <h3
        style={{ cursor: "pointer" }}
        onClick={() => nextProductDetail(product.id)}
      >
        {product.title || product.name}
      </h3>

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
            color: "#e70303",
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
            color: "#e70303",
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
  );
};

export default ProductCard;
