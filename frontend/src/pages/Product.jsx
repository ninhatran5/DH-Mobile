import { useDispatch, useSelector } from "react-redux";
import Products from "../components/ListProducts";
import { useEffect } from "react";
import { fetchProducts } from "../slices/productSlice";
import { fetchProductVariants } from "../slices/productVariantsSlice";

const Product = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const { productsVariants } = useSelector((state) => state.productsVariant);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductVariants());
  }, [dispatch]);
  return (
    <>
      <Products
        products={products}
        loading={loading}
        productsVariant={productsVariants.length > 0 ? productsVariants : []}
        showHeader={false}
      />
    </>
  );
};
export default Product;
