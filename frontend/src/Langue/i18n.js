// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: "Home",
      products: "Products",
      blogs: "Blogs",
      introduce: "Introduce",
      services: "Services",
      policy: "Return Policy",
      warranty: "Warranty",
      delivery: "Delivery Policy",
    },
  },
  vi: {
    translation: {  
      home: "Trang chủ",
      products: "Sản phẩm",
      blogs: "Bài viết",
      introduce: "Giới thiệu",
      services: "Dịch vụ",
      policy: "Chính sách đổi trả",
      warranty: "Chính sách bảo hành",
      delivery: "Chính sách giao hàng",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "vi", // Ngôn ngữ mặc định
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
