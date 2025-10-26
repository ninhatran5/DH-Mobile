import { useTranslation } from "react-i18next";
import Breadcrumb from "../components/Breadcrumb";
import { useEffect } from "react";
import { fetchRank } from "../slices/rankSlice";
import { useDispatch, useSelector } from "react-redux";
import "../assets/css/memberRank.css";
import { numberFormatRanks } from "../../utils/numberFormatRanks";
import Loading from "../components/Loading";
import { fetchProfile } from "../slices/profileSlice";
import backgroundCard from "../assets/images/background-card.jpg";

export default function MemberRank() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { ranks, loading } = useSelector((state) => state.rank);
  const { profile } = useSelector((state) => state.profile);
  const currentPoint = ranks?.loyalty_points;
  const currentRank = ranks?.current_tier;
  const nextRank = ranks?.next_tier;

  const percent = Math.min(
    100,
    Math.round(
      ((currentPoint - currentRank?.min_points) /
        (nextRank?.min_points - currentRank?.min_points)) *
        100
    )
  );

  useEffect(() => {
    dispatch(fetchRank());
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("breadcrumbMemberRank.breadcrumbHeader")}
        mainItem={t("breadcrumbVoucher.breadcrumbTitleHome")}
        secondaryItem={t("breadcrumbMemberRank.breadcrumbHeader")}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <div className="member-rank-wrapper mb-5">
        <div className="member-rank-left">
          <div className="member-rank-card">
            <div className="member-rank-card-header">
              <div
                className="member-rank-icon"
                style={{
                  borderColor: currentRank?.color,
                  boxShadow: `0 4px 24px ${currentRank?.color}33, 0 1.5px 8px #b0b0b033`,
                }}
              >
                <img width={60} src={currentRank?.image_url} alt="" />
              </div>
              <div
                className="member-rank-title"
                style={{ color: currentRank?.color, marginBottom: "-13px" }}
              >
                {currentRank?.name}
              </div>
              <div className="member-rank-point-label">
                {t("memberRank.currentPointLabel")}{" "}
                <b style={{ color: currentRank?.color }}>
                  {numberFormatRanks(currentPoint)}
                </b>{" "}
                {t("memberRank.pointUnit")}
              </div>
              <div className="member-rank-discount">
                {t("memberRank.discount")}:{" "}
                <b style={{ color: currentRank?.color }}>
                  {currentRank?.discount_percent}
                </b>
              </div>
            </div>
            <div className="member-rank-progress">
              <div className="member-rank-progress-label">
                <span>{currentRank?.name}</span>
                <span>{nextRank?.name}</span>
              </div>
              <div className="member-rank-progress-bar">
                {nextRank?.name && nextRank?.min_points > 0 ? (
                  <>
                    <div
                      className="member-rank-progress-bar-inner"
                      style={{
                        width: percent + "%",
                        background: `linear-gradient(90deg, ${currentRank?.color} 60%, ${nextRank?.color} 100%)`,
                        boxShadow: `0 2px 8px ${currentRank?.color}33`,
                      }}
                    />
                    <div
                      className="member-rank-progress-point"
                      style={{
                        left: `calc(${percent}% - 22px)`,
                        color: currentRank?.color,
                      }}
                    >
                      {numberFormatRanks(currentPoint)}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "20px",
                      borderRadius: "10px",
                      background:
                        "linear-gradient(90deg, #3b82f6 60%, #2563eb 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    <span style={{ width: "100%", textAlign: "center" }}>
                      {t("memberRank.max")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {nextRank?.name && nextRank?.min_points > 0 ? (
            <div className="member-rank-card next">
              <div className="member-rank-next-header">
                <div className="member-rank-next-icon">
                  <img width={38} src={nextRank?.image_url} alt="" />
                </div>
                <span
                  className="member-rank-title"
                  style={{ color: nextRank?.color }}
                >
                  {nextRank?.name}
                </span>
              </div>
              <div
                className="member-rank-next-label"
                style={{ color: nextRank?.color, marginTop: "-10px" }}
              >
                {t("memberRank.nextRank")}: {nextRank?.name}
              </div>
              <div
                className="member-rank-next-point"
                style={{ marginTop: "-3px" }}
              >
                {t("memberRank.pointsRemaining", {
                  points: numberFormatRanks(nextRank?.points_needed),
                })}
              </div>
              <div
                className="member-rank-next-require"
                style={{ marginTop: "3px" }}
              >
                {t("memberRank.requirement", {
                  points: numberFormatRanks(nextRank?.min_points),
                })}
              </div>
            </div>
          ) : (
            <div className="member-rank-card next member-rank-max">
              <div className="member-rank-max-title">
                {t("memberRank.maxRankTitle")}
              </div>
              <div className="member-rank-max-desc">
                {t("memberRank.maxRankDesc")}
              </div>
              <div className="member-rank-max-benefit">
                {t("memberRank.maxRankBenefit")}
              </div>
            </div>
          )}
        </div>
        <div
          className="member-rank-avatar-card"
          style={{ backgroundImage: `url(${backgroundCard})` }}
        >
          <div className="member-rank-avatar-img">
            <img src={profile?.user?.image_url} alt="avatar" />
          </div>
          <div className="member-rank-avatar-name">
            {profile?.user?.full_name}
          </div>
        </div>
      </div>
    </>
  );
}
