import { useRoutes } from "react-router-dom";
import "../src/assets/css/style.css";
import Home from "./pages/Home";
import Layout from "./layouts/Client";
import Product from "./pages/Product";
import Blog from "./pages/Blog";
import Introduce from "./pages/Introduce";
import ErrorPage from "./pages/Error";
import BlogDetail from "./pages/BlogDetail";
import ShoppingCart from "./pages/ShoppingCart";
import Guarantee from "./pages/Guarantee";
import ReturnPolicy from "./pages/ReturnPolicy";
import DeliveryPolicy from "./pages/DeliveryPolicy";
import CheckOut from "./pages/CheckOut";
import ChangeCheckout from "./pages/ChangeCheckout";
import ThanksYou from "./pages/ThanksYou";
import Voucher from "./pages/Voucher";
import CheckImei from "./pages/CheckImei";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ProductDetail from "./pages/ProductDetail";

import HomeAdmin from "./pages/admin/HomeAdmin";
import Chart from "./pages/admin/Chart";
import AddProduct from "./pages/admin/AddProduct";
import ProductList from "./pages/admin/ProductList";
import Categories from "./pages/admin/Categories";
import AddCategories from "./pages/admin/AddCategory";
import ChatBotAdmin from "./pages/admin/Chatbot";
import AcccountList from "./pages/admin/AccountsList";
import FavoriteProducts from "./pages/FavoriteProducts";
import OrderTable from "./components/OrderTable";
import OrderDetail from "./components/OrderDetail";
import AddAccount from "./pages/admin/AddAccount";
import OrdersList from "./pages/admin/OrdersList";
import OrdersCompleted from "./pages/admin/OrdersCompleted";
import OrdersCancelled from "./pages/admin/OrdersCancelled";
import VoucherList from "./pages/admin/VoucherList";
import AddVoucher from "./pages/admin/AddVoucher";
import ListBanner from "./pages/admin/ListBanner";
import CommentsList from "./pages/admin/CommentsList";
import ShowProduct from "./pages/admin/ShowProduct";
import ScrollToTop from "../utils/ScrollToTop";
import RequireAuth from "./components/RequireAuth";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import PublicRouteAdmin from "./components/PublicRouteAdmin";
import EditBanner from "./pages/admin/EditBanner";
import EditCategory from "./pages/admin/EditCategories";
const withLayoutClient = (Component, requireAuth = false) => {
  const wrappedComponent = (
    <Layout>
      <Component />
    </Layout>
  );

  return requireAuth ? (
    <RequireAuth>{wrappedComponent}</RequireAuth>
  ) : (
    wrappedComponent
  );
};

const routerConfig = [
  {
    path: "/",
    element: withLayoutClient(Home),
  },
  {
    path: "/products",
    element: withLayoutClient(Product),
  },
  {
    path: "/blogs",
    element: withLayoutClient(Blog),
  },
  {
    path: "/introduce",
    element: withLayoutClient(Introduce),
  },
  {
    path: "/blog-detail/:id",
    element: withLayoutClient(BlogDetail),
  },
  {
    path: "/shopping-cart",
    element: withLayoutClient(ShoppingCart, true),
  },
  {
    path: "/checkout",
    element: withLayoutClient(CheckOut, true),
  },
  {
    path: "/change-checkout",
    element: withLayoutClient(ChangeCheckout, true),
  },
  {
    path: "/thank-you",
    element: withLayoutClient(ThanksYou, true),
  },
  {
    path: "/vouchers",
    element: withLayoutClient(Voucher, true),
  },
  {
    path: "/check-imei",
    element: withLayoutClient(CheckImei),
  },
  {
    path: "/warranty-policy",
    element: withLayoutClient(Guarantee),
  },
  {
    path: "/return-policy",
    element: withLayoutClient(ReturnPolicy),
  },
  {
    path: "/delivery-policy",
    element: withLayoutClient(DeliveryPolicy),
  },
  {
    path: "/profile/:id",
    element: withLayoutClient(Profile, true),
  },
  {
    path: "/edit-profile/:id",
    element: withLayoutClient(EditProfile, true),
  },
  {
    path: "/product-detail/:id",
    element: withLayoutClient(ProductDetail),
  },
  {
    path: "/favorite-products",
    element: withLayoutClient(FavoriteProducts, true),
  },
  {
    path: "/order-history",
    element: withLayoutClient(OrderTable, true),
  },
  {
    path: "/order-detail/:id",
    element: withLayoutClient(OrderDetail, true),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
  },

  {
    path: "/admin",
    element: 
      <ProtectedRoute>
      <HomeAdmin />,
</ProtectedRoute>,
    
    children: [
      {
        path: "",
        element: <Chart />,
      },
      {
        path: "product",
        element: <ProductList />,
      },
      {
        path: "product/:id",
        element: <ShowProduct />,
      },
      {
        path: "addproduct",
        element: <AddProduct />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "Addcategories",
        element: <AddCategories />,
      },
      {
        path: "chatbot",
        element: <ChatBotAdmin />,
      },
      {
        path: "accounts",
        element: <AcccountList />,
      },

      {
        path: "addaccount",
        element: <AddAccount />,
      },
      {
        path: "orders",
        element: <OrdersList />,
      },
      {
        path: "orders-completed",
        element: <OrdersCompleted />,
      },
      {
        path: "orders-cancelled",
        element: <OrdersCancelled />,
      },
      {
        path: "vouchers",
        element: <VoucherList />,
      },
      {
        path: "addvoucher",
        element: <AddVoucher />,
      },
      {
        path: "banners",
        element: <ListBanner />,
      },
      {
        path:"editbanner/:id",
        element:<EditBanner/>
      },
      {
        path: "comments",
        element: <CommentsList />,
      },
      {
        path: "EditCategories/:id",
        element: <EditCategory />,
      }
    ],
  },
{
    path: "/AdminLogin",
    element: (
      <PublicRouteAdmin>
        <AdminLogin />
      </PublicRouteAdmin>
    ),
  }
  ,
  {
    path: "*",
    element: <ErrorPage />,
  },
];

function App() {
  const routers = useRoutes(routerConfig);
  return (
    <>
      <ScrollToTop />
      {routers}
    </>
  );
}

export default App;
