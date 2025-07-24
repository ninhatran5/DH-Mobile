import "../assets/css/profile.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import OrderHistory from "../components/OrderHistory";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProfile } from "../slices/profileSlice";
import Loading from "../components/Loading";
import { fetchListFavorite } from "../slices/favoriteProductsSlice";
import { fetchOrder } from "../slices/orderSlice";
import { fetchRank } from "../slices/rankSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const { ranks } = useSelector((state) => state.rank);
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { listFavorite } = useSelector((state) => state.favoriteProduct);
  const { orders } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchListFavorite());
    dispatch(fetchProfile());
    dispatch(fetchOrder());
    dispatch(fetchRank());
  }, [dispatch]);

  const personalInformations = [
    {
      id: 1,
      title: t("profile.personalInformations.name"),
      content: profile?.user?.full_name || "Chưa cập nhật",
    },
    {
      id: 2,
      title: t("profile.personalInformations.phone"),
      content: profile?.user?.phone || "Chưa cập nhật",
    },
    {
      id: 3,
      title: t("profile.personalInformations.email"),
      content: profile?.user?.email || "Chưa cập nhật",
    },
    {
      id: 4,
      title: t("profile.personalInformations.hometown"),
      content: profile?.user?.city || "Chưa cập nhật",
    },
  ];
  const statisticals = [
    {
      id: 1,
      label: t("profile.statisticals.orders"),
      value: `${orders?.orders?.length ?? 0} ${t("profile.order")}`,
    },
    {
      id: 2,
      label: t("profile.statisticals.wallet"),
      value: "10.000đ",
    },
    {
      id: 3,
      label: t("profile.statisticals.likedProducts"),
      value: `${listFavorite?.length ?? 0} ${t("profile.product")}`,
    },
  ];

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userID");
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      toast.error(error);
    }
  };
  const features = [
    {
      id: 1,
      name: t("profile.featuresList.favoriteProducts"),
      links: "/favorite-products",
    },
    {
      id: 2,
      name: t("breadcrumbVoucher.breadcrumbHeaderForMe"),
      links: "/my-discount-code",
    },
    {
      id: 3,
      name: t("profile.featuresList.rank"),
      links: "/member-rank",
    },
    {
      id: 4,
      name: t("profile.featuresList.orders"),
      links: "/order-history",
    },
    {
      id: 5,
      name: t("profile.featuresList.logout"),
      onClick: handleLogout,
    },
  ];

  if (profile.user?.role === "admin") {
    features.unshift({
      id: 1,
      name: t("profile.featuresList.adminLogin"),
      links: "/admin",
    });
  }

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("profile.title")}
        mainItem={t("profile.home")}
        secondaryItem={t("profile.title")}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <div className="profile-content" style={{ marginTop: "-15px" }}>
        <div className="container-fluid">
          <div className="profile-row">
            <div className="profile-col-full">
              <div className="profile-box profile-box-bg">
                <div className="profile-row">
                  <div className="profile-col-half">
                    <span className="profile-avatar">
                      <img
                        src={
                          profile?.user?.image_url ||
                          "https://bootdey.com/img/Content/avatar/avatar1.png"
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://bootdey.com/img/Content/avatar/avatar1.png";
                        }}
                        alt="avatar"
                        className="profile-img"
                      />
                    </span>
                    <div className="profile-user-info">
                      <h4
                        className="profile-username"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {profile?.user?.full_name}
                        {ranks?.current_tier?.image_url && (
                          <span className="profile-rank-badge">
                            <img
                              src={ranks?.current_tier?.image_url}
                              alt={ranks?.current_tier?.name}
                              title={ranks?.current_tier?.name}
                              className="profile-rank-img"
                            />
                            <span className="profile-rank-name">
                              {ranks?.current_tier?.name}
                            </span>
                          </span>
                        )}
                      </h4>
                      <p className="profile-location">
                        @{profile?.user?.username}
                      </p>
                    </div>
                  </div>
                  <div className="profile-col-half">
                    <div className="profile-edit-wrapper">
                      <Link
                        to={`/edit-profile/${id}`}
                        className="profile-btn-edit"
                      >
                        <i className="mdi mdi-account-settings-variant" />
                        {t("profile.editProfile")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-col-4">
              <div className="profile-card">
                <h4 className="profile-title">{t("profile.introduction")}</h4>
                <div className="profile-body">
                  <p className="profile-description">
                    {t("profile.description")}
                    <strong className="ms-1">{profile?.user?.full_name}</strong>
                    {t("profile.titleHello")}
                  </p>
                  <hr />
                  <h4 className="profile-title mb-2">
                    {t("profile.personalInfo")}
                  </h4>
                  <div className="profile-info-list">
                    {personalInformations.map((personalInformation) => (
                      <p key={personalInformation.id}>
                        <strong className="me-1">
                          {personalInformation.title}
                        </strong>
                        <span>{personalInformation.content}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-card profile-ribbon">
                <div className="profile-ribbon-title">
                  {t("profile.features")}
                </div>
                {features.map((feature) => (
                  <div key={feature.id} className="profile-messages">
                    {feature.links ? (
                      <Link to={feature.links} className="profile-message-item">
                        <button className="profile-btn-reply">
                          {feature.name}
                        </button>
                      </Link>
                    ) : (
                      <button
                        className="profile-btn-reply"
                        onClick={feature.onClick}
                      >
                        {feature.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="profile-col-8">
              <div className="profile-row">
                {statisticals.map((item) => (
                  <div className="profile-col-4" key={item.id}>
                    <div className="profile-card">
                      <h6 className="profile-stat-label">{item.label}</h6>
                      <h2 className="profile-stat-value">{item.value}</h2>

                      <span className="profile-muted-text">
                        {t("profile.orderStats")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="profile-card">
                <div className="d-flex col-12">
                  <h4 className="profile-title mb-3 col-9">
                    {t("profile.orderHistoryTitle")}
                  </h4>
                  <Link
                    to={"/order-history"}
                    className="text-decoration-none  col-3"
                  >
                    <h4 className="text-end profile-title mb-3">
                      {t("profile.seeAll")}
                    </h4>
                  </Link>
                </div>
                <div className="profile-table-wrapper">
                  <table className="profile-table">
                    <thead>
                      <tr>
                        <th>{t("orderHistory.orderCode")}</th>
                        <th>{t("orderHistory.orderName")}</th>
                        <th>{t("orderHistory.paymentMethod")}</th>
                        <th>{t("orderHistory.payment_status")}</th>
                        <th>{t("orderHistory.address")}</th>
                        <th>{t("orderHistory.price")}</th>
                        <th>{t("orderHistory.status")}</th>
                        <th>{t("orderHistory.detail")}</th>
                      </tr>
                    </thead>
                    {orders?.orders?.slice(0, 4).map((order) => (
                      <OrderHistory key={order?.order_id} order={order} />
                    ))}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
