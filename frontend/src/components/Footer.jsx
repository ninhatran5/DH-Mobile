import { LiaFacebookF } from "react-icons/lia";
import logo from "../assets/images/logo2.png";
import { FaBehance, FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const iconLogoSocial = [
    {
      id: 1,
      icon: <LiaFacebookF />,
      link: "https://www.facebook.com/xengdayy",
    },
    {
      id: 2,
      icon: <FaInstagram />,
      link: "https://www.instagram.com/tungthuyfake",
    },
    {
      id: 3,
      icon: <FaGithub />,
      link: "https://github.com/LeNguyenXeng",
    },
    {
      id: 4,
      icon: <FaBehance />,
      link: "https://www.behance.net/lenguyenxeng",
    },
  ];

  const footerData = [
    {
      id: 1,
      title: t("header.info"),
      information: [
        { label: t("header.home"), url: "/" },
        { label: t("header.products"), url: "/products" },
        { label: t("header.blog"), url: "/blogs" },
        { label: t("header.introduce"), url: "/introduce" },
      ],
    },
    {
      id: 2,
      title: t("header.customer_support"),
      information: [
        { label: t("header.warrantyPolicy"), url: "/warranty-policy" },
        { label: t("header.returnPolicy"), url: "/return-policy" },
        { label: t("header.deliveryPolicy"), url: "/delivery-policy" },
        { label: t("header.checkImei"), url: "/checkimei" },
      ],
    },
    {
      id: 3,
      title: t("header.connect_with_us"),
      information: [
        { label: "Hotline: 0396 180 619" },
        { label: t("header.chat") },
        { label: t("header.voucher"), url: "/vouchers" },
      ],
    },
  ];

  return (
    <>
      <footer className="py-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-menu">
                <img src={logo} width="100%" alt="Logo DH Mobile" />
                <div className="social-links mt-5">
                  <ul className="d-flex list-unstyled gap-2">
                    {iconLogoSocial.map((item) => (
                      <li key={item.id} onClick={() => window.open(item.link)}>
                        <a href="#" className="btn btn-outline-light">
                          {item.icon}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {footerData.map((data) => (
              <div className="col-md-2 col-sm-6" key={data.id}>
                <div className="footer-menu">
                  <h5 className="widget-title">{data.title}</h5>
                  <ul className="menu-list list-unstyled">
                    {data.information.map((item, index) => (
                      <li key={index} className="menu-item">
                        <Link
                          to={item.url || "/"}
                          className="menu-des nav-link"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="footer-menu">
                <h5 className="widget-title">{t("header.feedback_with_us")}</h5>
                <p>{t("header.we_are_pleased_to_hear")}</p>
                <form className="d-flex mt-3 gap-0" role="newsletter">
                  <input
                    className="form-control rounded-start rounded-0 bg-light"
                    type="email"
                    placeholder={t("header.email_address")}
                    aria-label="Email Address"
                  />
                  <button className="btn btn-dark rounded-end rounded-0">
                    {t("header.send")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
