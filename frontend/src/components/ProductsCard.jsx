import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import checkLogin from "../../utils/checkLogin";
import numberFormat from "../../utils/numberFormat";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFavoriteProduct,
  fetchListFavorite,
} from "../slices/favoriteProductsSlice";

const ProductCard = ({ discountPercent, product }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { favoriteProducts: _ } = useSelector((state) => state.favoriteProduct);
  const [favorite, setFavorite] = useState(product.favorite);

  const handleUnFavorites = () => {
    setFavorite(false);
    toast.success(t("products.removeFavorites"));
  };

  const nextProductDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const addToFavorites = async () => {
    if (!checkLogin()) {
      return;
    }
    try {
      await dispatch(fetchFavoriteProduct(product.product_id));
      setFavorite(true);
      toast.success(t("products.addedToFavorites"));
      dispatch(fetchListFavorite());
    } catch (error) {
      toast.error(error || t("products.errorAddingFavorite"));
    }
  };

  const addToShoppingCart = () => {
    if (checkLogin()) {
      toast.success(t("products.addedToCart"));
      navigate("/shopping-cart");
    }
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
          onClick={() => nextProductDetail(product.product_id)}
          src={product.image_url}
          className="tab-image"
          alt={product.name}
          title={product.title || product.name}
        />
      </figure>

      <h3
        style={{ cursor: "pointer" }}
        onClick={() => nextProductDetail(product.product_id)}
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
          {numberFormat(product?.price)}
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
          {numberFormat(product?.price_original)}
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
