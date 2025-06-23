import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const ThanksYou = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNextPageOrderHistory = () => {
    navigate("/order-history");
  };

  return (
    <div className="container d-flex justify-content-center">
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
            width={85}
            height={85}
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ color: "#198754" }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
          </motion.svg>
        </motion.div>

        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t("thanksYou.paymentSuccess")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t("thanksYou.thankYouMessage")}
            <br />
            {t("thanksYou.thankYouMessage2")}
          </motion.p>

          <motion.div
            className="d-flex justify-content-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to={"/"}>
              <button className="btn btn-outline-success mt-3">
                {t("thanksYou.backToHome")}
              </button>
            </Link>
            <button
              style={{ marginLeft: 5 }}
              className="btn btn-outline-danger mt-3"
              onClick={handleNextPageOrderHistory}
            >
              {t("thanksYou.trackOrder")}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThanksYou;
