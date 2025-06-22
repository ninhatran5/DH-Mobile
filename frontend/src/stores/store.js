import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "../slices/homeSlice";
import registerReducer from "../slices/registerSlice";
import loginReducer from "../slices/loginSlice";
import adminLoginReducer from "../slices/adminLoginSlice";
import forgotPasswordReducer from "../slices/forgotPasswordSlice";
import profileReducer from "../slices/profileSlice";
import editProfileReducer from "../slices/updateProfileSlice";
import addressReducer from "../slices/addressSlice";
import changePasswordReducer from "../slices/changePasswordSlice";
import productReducer from "../slices/productSlice";
import productsVariantReducer from "../slices/productVariantsSlice";
import productDetailReducer from "../slices/productDetailSlice";
import productVariationDetailReducer from "../slices/productVariationDetails";
import bannerReducer from "../slices/BannerSlice";
import blogReducer from "../slices/blogSlice";
import favoriteProductReducer from "../slices/favoriteProductsSlice";
import categoryReducer from "../slices/adminCategories";
import attributeReducer from "../slices/Attribute";
import attributeValueReducer from "../slices/attributeValueSlice";
import categorysReducer from "../slices/categorySlice";
import blogDetailReducer from "../slices/blogDetailSlice";
import voucherReducer from "../slices/voucherSlice";
import adminProductReducer from "../slices/adminproductsSlice";
import adminProductSpecificationsReducer from "../slices/adminProductSpecificationsSlice";
import adminProductVariantsReducer from "../slices/AdminProductVariants";
import cartReducer from "../slices/cartSlice";
import variantAttributeValueReducer from "../slices/variantAttributeValueSlice";
import specificationReducer from "../slices/specificationsSlice";
import adminuserReducer from "../slices/adminuserSlice";
import adminVoucherReducer from "../slices/AdminVoucher";
import adminNewsReducer from "../slices/newsSlice";
import viewProductReducer from "../slices/viewProductSlice";
import paymentReducer from "../slices/checkOutSlice";
import adminOrderReducer from "../slices/adminOrderSlice";
import changeAddressReducer from "../slices/changeAddressSlice";
import ordersReducer from "../slices/orderSlice"; 
import adminNotificationReducer from "../slices/NotificationSlice";
import adminChatReducer from "../slices/AdminChatSlice";
export const store = configureStore({
  reducer: {
    home: homeReducer,
    register: registerReducer,
    login: loginReducer,
    adminLogin: adminLoginReducer,
    forgotPassword: forgotPasswordReducer,
    profile: profileReducer,
    order: ordersReducer,
    editProfile: editProfileReducer,
    address: addressReducer,
    changePassword: changePasswordReducer,
    product: productReducer,
    productsVariant: productsVariantReducer,
    categorys: categorysReducer,
    productDetail: productDetailReducer,
    productVariationDetail: productVariationDetailReducer,
    banner: bannerReducer,
    blog: blogReducer,
    changeAddress: changeAddressReducer,
    blogDetail: blogDetailReducer,
    cart: cartReducer,
    favoriteProduct: favoriteProductReducer,
    viewProduct: viewProductReducer,
    voucher: voucherReducer,
    category: categoryReducer,
    payment: paymentReducer,
    attribute: attributeReducer,
    attributeValue: attributeValueReducer,
    adminproduct: adminProductReducer,
    variantAttributeValue: variantAttributeValueReducer,
    specification: specificationReducer,
    adminProductSpecifications: adminProductSpecificationsReducer,
    adminProductVariants: adminProductVariantsReducer,
    adminuser: adminuserReducer,
    adminVoucher: adminVoucherReducer,
    adminNews: adminNewsReducer,
    adminOrder: adminOrderReducer,
    adminNotification: adminNotificationReducer,
    adminChat: adminChatReducer,
  },
});
