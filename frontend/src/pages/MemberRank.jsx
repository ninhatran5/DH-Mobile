import { useTranslation } from "react-i18next";
import Breadcrumb from "../components/Breadcrumb";
import { useEffect } from "react";
import { fetchRank } from "../slices/rankSlice";
import { useDispatch, useSelector } from "react-redux";
import "../assets/css/memberRank.css";
import { numberFormatRanks } from "../../utils/numberFormatRanks";
import Loading from "../components/Loading";
import { fetchProfile } from "../slices/profileSlice";

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
        (nextRank?.points_needed - currentRank?.min_points)) *
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
        {/* Left: Rank Cards */}
        <div className="member-rank-left">
          {/* Card 1: Current Rank & Progress */}
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
                style={{ color: currentRank?.color }}
              >
                {currentRank?.name}
              </div>
              <div className="member-rank-point-label">
                Điểm hiện tại{" "}
                <b style={{ color: currentRank?.color }}>
                  {numberFormatRanks(currentPoint)}
                </b>
              </div>
            </div>
            <div className="member-rank-progress">
              <div className="member-rank-progress-label">
                <span>{currentRank?.name}</span>
                <span>{nextRank?.name}</span>
              </div>
              <div className="member-rank-progress-bar">
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
              </div>
            </div>
          </div>
          {/* Card 2: Next Rank Info */}
          <div className="member-rank-card next">
            <div className="member-rank-next-header">
              <img width={38} src={nextRank?.image_url} alt="" />
              <span
                className="member-rank-title"
                style={{ color: nextRank?.color }}
              >
                {nextRank?.name}
              </span>
            </div>
            <div
              className="member-rank-next-label"
              style={{ color: nextRank?.color }}
            >
              Hạng tiếp theo: {nextRank?.name}
            </div>
            <div className="member-rank-next-point">
              Còn {numberFormatRanks(nextRank?.points_needed - currentPoint)}{" "}
              điểm để lên hạng
            </div>
            <div className="member-rank-next-require">
              Yêu cầu: {numberFormatRanks(nextRank?.points_needed)} điểm
            </div>
          </div>
        </div>
        {/* Right: Avatar Card */}
        <div className="member-rank-avatar-card">
          <div className="member-rank-avatar-img">
            <img src={profile?.user?.image_url} alt="avatar" />
          </div>
          <div className="member-rank-avatar-name">
            {profile?.user?.full_name}
          </div>
          <div className="member-rank-avatar-label">
            @{profile?.user?.username}
          </div>
        </div>
      </div>
    </>
  );
}
