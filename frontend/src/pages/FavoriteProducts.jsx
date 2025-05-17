import { useTranslation } from "react-i18next";
import Breadcrumb from "../components/Breadcrumb";
import ListProducts from "../components/ListProducts";

const FavoriteProducts = () => {
  const { t } = useTranslation();
  return (
    <>
      <Breadcrumb
        title={t("breadcrumbLiked.breadcrumbHeader")}
        mainItem={t("breadcrumbVoucher.breadcrumbTitleHome")}
        secondaryItem={t("breadcrumbLiked.breadcrumbHeader")}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <ListProducts showHeader={false} filter={false} />
    </>
  );
};
export default FavoriteProducts;
