import { useTranslation } from "react-i18next";
import Breadcrumb from "../components/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Loading from "../components/Loading";
import { fetchListFavorite } from "../slices/listFavoriteProducts";
import Product from "../components/Product";

const FavoriteProducts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { listFavorite, loading } = useSelector(
    (state) => state.listFavoriteProducts
  );

  useEffect(() => {
    dispatch(fetchListFavorite());
  }, [dispatch]);

  // Hàm tính phần trăm giảm giá (nếu muốn hiển thị badge giảm giá)
  const parsePrice = (priceStr) =>
    parseInt(priceStr?.replace(/[^\d]/g, "")) || 0;
  const getDiscountPercent = (product) => {
    const original = parsePrice(product.price_original);
    const sale = parsePrice(product.price);
    if (!original || !sale || sale >= original) return null;
    return Math.floor(((original - sale) / original) * 100);
  };

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("breadcrumbLiked.breadcrumbHeader")}
        mainItem={t("breadcrumbVoucher.breadcrumbTitleHome")}
        secondaryItem={t("breadcrumbLiked.breadcrumbHeader")}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <div className="container-fluid">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-5 row-cols-lg-5 row-cols-xl-5">
          {(Array.isArray(listFavorite?.data) ? listFavorite.data : []).map(
            (item) => (
              <Product
                key={item.product?.product_id || item.product_id}
                product={item.product || item}
                discountPercent={getDiscountPercent(item.product || item)}
                nextProductDetail={() => {}}
              />
            )
          )}
          {(!listFavorite?.data || listFavorite.data.length === 0) && (
            <h6 className="text-center text-muted fw-bold my-5 w-100">
              {t("products.noProductFound")}
            </h6>
          )}
        </div>
      </div>
    </>
  );
};
export default FavoriteProducts;
