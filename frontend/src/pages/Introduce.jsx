import { useTranslation } from "react-i18next";
import "../assets/css/introduce.css";
import SliderLogoBrand from "../components/SliderLogoBrand";

const Introduce = () => {
  const { t } = useTranslation();
  const sections = [
    {
      title: t("introduce.titleCard1"),
      content: t("introduce.descCard1"),
    },
    {
      title: t("introduce.titleCard2"),
      content: t("introduce.descCard2"),
    },
    {
      title: t("introduce.titleCard3"),
      content: t("introduce.descCard3"),
    },
    {
      title: t("introduce.titleCard4"),
      content: t("introduce.descCard4"),
    },
    {
      title: t("introduce.titleCard5"),
      content: t("introduce.descCard5"),
    },
  ];
  return (
    <div className="container">
      <div className="bg-white py-16 px-6 max-w-5xl mx-auto text-gray-800 leading-relaxed text-justify">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-400 mb-8 text-center">
          {t("introduce.title")}
        </h1>
        <p className="mb-6 mt-3">{t("introduce.smallTitle")}</p>
        <p className="mb-6">{t("introduce.smallTitle2")}</p>
        <SliderLogoBrand />
        {sections.map((section, index) => {
          return (
            <div
              key={index}
              className="section-box flex items-start gap-4 mt-5"
            >
              <div>
                <h2 className="section-title-introduce">{section.title}</h2>
                <p className="whitespace-pre-line text-gray-700">
                  {section.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Introduce;
