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
    path: "/blogdetails",
    element: withLayoutClient(BlogDetail),
  },
  {
    path: "/shoppingcart",
    element: withLayoutClient(ShoppingCart),
  },
  {
    path: "/checkout",
    element: withLayoutClient(CheckOut),
  },
  {
    path: "/changecheckout",
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
    path: "*",
    element: <ErrorPage />,
  },
];

function App() {
  const routers = useRoutes(routerConfig);
  return <>{routers}</>;
}

export default App;
