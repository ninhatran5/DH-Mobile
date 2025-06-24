import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const WaitingForPayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNextPageOrderHistory = () => {
    navigate("/order-history");
  };

  return (
    <div className="container-fluid d-flex justify-content-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          marginTop: 20,
          marginBottom: 50,
          border: "none",
        }}
      >
        <motion.div
          className="mb-4 text-center"
          initial={{ scale: 0 }}
          animate={{ scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="80"
            height="80"
            fill="#FFC107"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
          </motion.svg>
        </motion.div>

        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t("warn.paymentSuccess")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t("warn.thankYouMessage")}
            <br />
            {t("warn.thankYouMessage2")}
          </motion.p>

          <motion.div
            className="d-flex justify-content-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to={"/"}>
              <button className="btn btn-outline-success mt-3">
                {t("warn.backToHome")}
              </button>
            </Link>
            <button
              style={{ marginLeft: 5 }}
              className="btn btn-outline-danger mt-3"
              onClick={handleNextPageOrderHistory}
            >
              {t("warn.trackOrder")}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingForPayment;
