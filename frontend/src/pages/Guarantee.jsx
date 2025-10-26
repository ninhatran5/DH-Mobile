import { useTranslation } from "react-i18next";
import "../assets/css/guarantee.css";

const Guarantee = () => {
  const { t } = useTranslation();

  return (
    <div className="container">
      <div className="guarantee">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
            {t("guaranteePolicy.title")}
          </h1>
          <p className="text-des mb-4 text-gray-700">
            {t("guaranteePolicy.intro")}
          </p>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("guaranteePolicy.titleSmall1")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("guaranteePolicy.content1")}</li>
            <li>{t("guaranteePolicy.content2")}</li>
            <li>{t("guaranteePolicy.content3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("guaranteePolicy.titleSmall2")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("guaranteePolicy.content2_1")}</li>
            <li>{t("guaranteePolicy.content2_2")}</li>
            <li>{t("guaranteePolicy.content2_3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("guaranteePolicy.titleSmall3")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("guaranteePolicy.content3_1")}</li>
            <li>{t("guaranteePolicy.content3_2")}</li>
            <li>{t("guaranteePolicy.content3_3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("guaranteePolicy.titleSmall4")}
          </h2>
          <p className="text-gray-700 mb-2">
            {t("guaranteePolicy.content4_1")}
          </p>

          <p className="text-gray-700 font-medium">
            {t("guaranteePolicy.footer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guarantee;
