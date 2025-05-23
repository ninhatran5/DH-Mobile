import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import numberFormat from "../../utils/numberFormat";
import { toast } from "react-toastify";
import checkLogin from "../../utils/checkLogin";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteProduct } from "../slices/favoriteProductsSlice";
import { fetchListFavorite } from "../slices/listFavoriteProducts";

const Product = ({ product, discountPercent, nextProductDetail }) => {
  const dispatch = useDispatch();
  const { favoriteProducts: _ } = useSelector((state) => state.favoriteProduct);
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(product.favorite);
  const navigate = useNavigate();
  const handleUnFavorites = () => {
    console.log("un");
    setFavorite(false);
    toast.success(t("products.removeFavorites"));
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
      console.log("added");
      toast.success(t("products.addedToCart"));
      navigate("/shopping-cart");
    }
  };
  return (
    <>
      <div className="col" key={product.product_id}>
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
            <Link
              to={`/product-detail/${product.product_id}`}
              title={product.name}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="tab-image"
              />
            </Link>
          </figure>

          <h3
            onClick={() => nextProductDetail(product.product_id)}
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
              {numberFormat(product?.price)}
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
              {numberFormat(product?.price_original)}
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
