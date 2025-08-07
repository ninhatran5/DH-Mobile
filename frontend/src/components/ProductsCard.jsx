import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import checkLogin from "../../utils/checkLogin";
import numberFormat from "../../utils/numberFormat";
import numberFormatCoins from "../../utils/numberFormatCoins";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteFavoriteProduct,
  fetchFavoriteProduct,
  fetchListFavorite,
} from "../slices/favoriteProductsSlice";
import { addViewProducts } from "../slices/viewProductSlice";
import ProductModal from "./ProductModal";
import coins from "../assets/images/coins.png";

const ProductCard = ({ discountPercent, product }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const { listFavorite } = useSelector((state) => state.favoriteProduct);
  const userId = localStorage.getItem("userID");

  // Kiểm tra sản phẩm này có trong listFavorite không
  const isFavorite = listFavorite?.some(
    (item) =>
      item.product_id === product?.product_id ||
      item.product?.product_id === product?.product_id
  );

  const handleUnFavorites = async () => {
    if (!checkLogin()) return;
    try {
      await dispatch(deleteFavoriteProduct(product?.product_id)).unwrap();
      toast.success(t("products.removeFavorites"));
      // Không gọi lại fetchListFavorite ở đây nữa
    } catch (error) {
      toast.error(error?.message || t("products.errorRemovingFavorite"));
    }
  };

  const addToFavorites = async () => {
    if (!checkLogin()) {
      return;
    }
    try {
      await dispatch(fetchFavoriteProduct(product?.product_id));
      toast.success(t("products.addedToFavorites"));
      dispatch(fetchListFavorite());
    } catch (error) {
      toast.error(error || t("products.errorAddingFavorite"));
    }
  };

  const addToShoppingCart = () => {
    if (checkLogin()) {
      setShow(true);
    }
  };

  const coinsAccumulatePoints = (product?.price || 0) / 100;

  return (
    <>
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
            onClick={() => {
              dispatch(
                addViewProducts({
                  productId: product?.product_id,
                  userId,
                })
              );
              navigate(`/product-detail/${product?.product_id}`);
            }}
            src={product?.image_url}
            className="tab-image"
            alt={product?.name}
            title={product?.title || product?.name}
          />
        </figure>

        <h3
          style={{ cursor: "pointer" }}
          onClick={() => {
            dispatch(
              addViewProducts({
                productId: product?.product_id,
                userId,
              })
            );
            navigate(`/product-detail/${product?.product_id}`);
          }}
        >
          {product?.title || product?.name}
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
          <div className="card-coins-products d-flex align-items-center">
            <img style={{ width: 20 }} src={coins} alt="" />
            <p className="coins-products fw-bold" style={{marginTop: 17, marginLeft: 5}}>
              {numberFormatCoins(coinsAccumulatePoints)}
            </p>
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

export default ProductCard;
