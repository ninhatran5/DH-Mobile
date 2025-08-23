const allowedPages = [
  "/",
  "/products",
  "/blogs",
  "/introduce",
  "/vouchers",
  "/check-imei",
  "/warranty-policy",
  "/delivery-policy",
  "/return-policy",
  "/shopping-cart",
  "/checkout",
  "/favorite-products",
  "/my-discount-code",
  "/member-rank",
  "/order-history",
];

const dynamicRoutes = [
  "/blog-detail/",
  "/product-detail/",
  "/profile/",
  "/edit-profile/",
  "/order-detail/",
];

export const isAllowedPage = (pathname) => {
  if (allowedPages.includes(pathname)) return true;
  return dynamicRoutes.some((route) => pathname.startsWith(route));
};
