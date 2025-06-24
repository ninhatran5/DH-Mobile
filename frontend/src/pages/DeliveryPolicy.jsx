import { useTranslation } from "react-i18next";
import "../assets/css/guarantee.css";

const DeliveryPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="container-fluid">
      <div className="guarantee">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
            {t("deliveryPolicy.title")}
          </h1>
          <p className="text-des mb-4 text-gray-700">
            {t("deliveryPolicy.intro")}
          </p>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("deliveryPolicy.titleSmall1")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("deliveryPolicy.content1_1")}</li>
            <li>{t("deliveryPolicy.content1_2")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("deliveryPolicy.titleSmall2")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("deliveryPolicy.content2_1")}</li>
            <li>{t("deliveryPolicy.content2_2")}</li>
            <li>{t("deliveryPolicy.content2_3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("deliveryPolicy.titleSmall3")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("deliveryPolicy.content3_1")}
          </p>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("deliveryPolicy.titleSmall4")}
          </h2>
          <p className="text-gray-700 mb-4">
            {t("deliveryPolicy.content4_1")}
          </p>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("deliveryPolicy.titleSmall5")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("deliveryPolicy.content5_1")}</li>
            <li>{t("deliveryPolicy.content5_2")}</li>
          </ul>

          <p className="text-gray-700 font-medium">
            {t("deliveryPolicy.footer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPolicy;
