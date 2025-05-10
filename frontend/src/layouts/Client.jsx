import ChatBot from "../components/ChatBot";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <div>{children}</div>
      <ChatBot />
      <Footer />
    </>
  );
}
