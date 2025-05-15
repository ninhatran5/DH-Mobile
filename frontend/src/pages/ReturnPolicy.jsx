import { useTranslation } from "react-i18next";
import "../assets/css/guarantee.css";

const ReturnPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="container-fluid">
      <div className="guarantee">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
            {t("returnPolicy.title")}
          </h1>
          <p className="text-des mb-4 text-gray-700">
            {t("returnPolicy.intro")}
          </p>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("returnPolicy.titleSmall1")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("returnPolicy.content1_1")}</li>
            <li>{t("returnPolicy.content1_2")}</li>
            <li>{t("returnPolicy.content1_3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("returnPolicy.titleSmall2")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("returnPolicy.content2_1")}</li>
            <li>{t("returnPolicy.content2_2")}</li>
            <li>{t("returnPolicy.content2_3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("returnPolicy.titleSmall3")}
          </h2>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            <li>{t("returnPolicy.content3_1")}</li>
            <li>{t("returnPolicy.content3_2")}</li>
            <li>{t("returnPolicy.content3_3")}</li>
          </ul>

          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {t("returnPolicy.titleSmall4")}
          </h2>
          <p className="text-gray-700">{t("returnPolicy.content4_1")}</p>

          <p className="text-gray-700 font-medium">
            {t("returnPolicy.footer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
