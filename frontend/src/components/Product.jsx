import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import numberFormat from "../../utils/numberFormat";
import { toast } from "react-toastify";
import checkLogin from "../../utils/checkLogin";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteFavoriteProduct,
  fetchFavoriteProduct,
  fetchListFavorite,
} from "../slices/favoriteProductsSlice";
import ProductModal from "./ProductModal";

const Product = ({ product, discountPercent, onClick }) => {
  const dispatch = useDispatch();
  const { listFavorite } = useSelector((state) => state.favoriteProduct);
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  // Kiểm tra sản phẩm này có trong listFavorite không
  const isFavorite = listFavorite?.some(
    (item) => item.product_id === product?.product_id || item.product?.product_id === product?.product_id
  );
  const handleUnFavorites = async () => {
    if (!checkLogin()) return;
    try {
      await dispatch(deleteFavoriteProduct(product.product_id)).unwrap();
      toast.success(t("products.removeFavorites"));
      dispatch(fetchListFavorite());
    } catch (error) {
      toast.error(error?.message || t("products.errorRemovingFavorite"));
    }
  };

  const addToFavorites = async () => {
    if (!checkLogin()) return;
    try {
      await dispatch(fetchFavoriteProduct(product.product_id)).unwrap();
      toast.success(t("products.addedToFavorites"));
      dispatch(fetchListFavorite());
    } catch (error) {
      toast.error(error?.message || t("products.errorAddingFavorite"));
    }
  };

  const addToShoppingCart = () => {
    if (checkLogin()) {
      setShow(true);
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

          {!isFavorite ? (
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
                onClick={onClick}
                src={product.image_url}
                alt={product.name}
                className="tab-image"
              />
            </Link>
          </figure>

          <h3 onClick={onClick} style={{ cursor: "pointer" }}>
            {product.name}
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
      <ProductModal
        show={show}
        onHide={() => setShow(false)}
        product={product}
      />
    </>
  );
};
export default Product;
