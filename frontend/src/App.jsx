/* eslint-disable no-unused-vars */
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
import SetNewPassword from "./pages/ChangePassword";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ProductDetail from "./pages/ProductDetail";
import FavoriteProducts from "./pages/FavoriteProducts";
import OrderHistory from "./components/OrderHistory";
import OrderTable from "./components/OrderTable";
import OrderDetail from "./components/OrderDetail";

const withLayoutClient = (Component) => {
  return (
    <Layout>
      <Component />
    </Layout>
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
    path: "/blogdetails?:id",
    element: withLayoutClient(BlogDetail),
  },
  {
    path: "/shopping-cart",
    element: withLayoutClient(ShoppingCart),
  },
  {
    path: "/checkout",
    element: withLayoutClient(CheckOut),
  },
  {
    path: "/change-checkout",
    element: withLayoutClient(ChangeCheckout),
  },
  {
    path: "/thanksyou",
    element: withLayoutClient(ThanksYou),
  },
  {
    path: "/voucher",
    element: withLayoutClient(Voucher),
  },
  {
    path: "/checkimei",
    element: withLayoutClient(CheckImei),
  },
  {
    path: "/guarantee",
    element: withLayoutClient(Guarantee),
  },
  {
    path: "/returnpolicy",
    element: withLayoutClient(ReturnPolicy),
  },
  {
    path: "/deliverypolicy",
    element: withLayoutClient(DeliveryPolicy),
  },
  {
    path: "/profile",
    element: withLayoutClient(Profile),
  },
  {
    path: "/edit-profile",
    element: withLayoutClient(EditProfile),
  },
  {
    path: "/product-detail/:id",
    element: withLayoutClient(ProductDetail),
  },
  {
    path: "/favorite-products",
    element: withLayoutClient(FavoriteProducts),
  },
  {
    path: "/order-history",
    element: withLayoutClient(OrderTable),
  },
  {
    path: "/order-detail/:id",
    element: withLayoutClient(OrderDetail),
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
    path: "*",
    element: <ErrorPage />,
  },
];

function App() {
  const routers = useRoutes(routerConfig);
  return <>{routers}</>;
}

export default App;
