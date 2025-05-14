import Breadcrumb from "../components/Breadcrumb";
import Products from "../components/Products";

const FavoriteProducts = () => {
  return (
    <>
      <Breadcrumb
        title={"Sản Phẩm Yêu Thích"}
        mainItem={"Trang chủ"}
        secondaryItem={"Sản phẩm bạn đã thích"}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <Products showHeader={false} filter={false} unfavorite={false} />
    </>
  );
};
export default FavoriteProducts;
