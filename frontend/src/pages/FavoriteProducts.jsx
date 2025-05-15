import { useTranslation } from "react-i18next";
import Breadcrumb from "../components/Breadcrumb";
import Products from "../components/Products";

const FavoriteProducts = () => {
  const { t } = useTranslation();
  return (
    <>
      <Breadcrumb
        title={t('breadcrumbLiked.breadcrumbHeader')}
        mainItem={t('breadcrumbVoucher.breadcrumbTitleHome')}
        secondaryItem={t('breadcrumbLiked.breadcrumbHeader')}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <Products showHeader={false} filter={false} unfavorite={false} />
    </>
  );
};
export default FavoriteProducts;
