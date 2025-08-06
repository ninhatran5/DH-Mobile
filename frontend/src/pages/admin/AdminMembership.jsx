/* eslint-disable no-unused-vars */
// AdminMembership.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminLoyaltyTiers,
  updateAdminLoyaltyTier,
} from "../../slices/adminMembership";
import "../../assets/admin/AdminMembership.css";
import coinIcon from "../../assets/images/icons8-coin.gif";
import cancel from "../../assets/images/cancel-close-svgrepo-com.svg";
import dayjs from "dayjs";
import Loading from "../../components/Loading";
import { FaEdit } from "react-icons/fa";

const AdminMembership = () => {
  const dispatch = useDispatch();
  const { loyaltyTiers, loading, error, updateLoading, updateError } =
    useSelector((state) => state.adminMembership);

  const [editTier, setEditTier] = useState(null);
  const [form, setForm] = useState({
    name: "",
    image_url: "",
    min_points: "",
    discount_percent: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    dispatch(fetchAdminLoyaltyTiers());
  }, [dispatch]);

  const handleEditClick = (tier) => {
    setEditTier(tier);
    setForm({
      tier_id: tier.tier_id,
      name: tier.name || "",
      image_url: tier.image_url || "",
      min_points: tier.min_points?.toString() || "",
      discount_percent:
        tier.discount_percent?.toString().replace("%", "") || "",
    });
    setImageFile(null);
    setImagePreview(tier.image_url || "");
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setImageFile(file);
      setImagePreview(file ? URL.createObjectURL(file) : "");
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editTier) return;

    if (imageFile) {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("min_points", form.min_points);
      formData.append("discount_percent", form.discount_percent);
      formData.append("image", imageFile);
      await dispatch(
        updateAdminLoyaltyTier({
          id: editTier.tier_id,
          data: formData,
          isFormData: true,
        })
      );
    } else {
      await dispatch(
        updateAdminLoyaltyTier({ id: editTier.tier_id, data: form })
      );
    }

    setEditTier(null);
    dispatch(fetchAdminLoyaltyTiers());
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="text-danger text-center my-4">Lỗi: {error}</div>;

  return (
    <div className="admin-membership-tier-cards container">
      <div className="row">
        {loyaltyTiers.map((tier) => {
          const isEditing = editTier?.tier_id === tier.tier_id;
          return (
            <div className="col-md-3 mb-4" key={tier.tier_id}>
              <div className={`flip-card ${isEditing ? "flipped" : ""}`}>
                <div className="flip-card-inner">
                  {/* FRONT */}
                  <div className="flip-card-front tier-card tier-${tier.slug} position-relative">
                    <button
                      className="btn btn-link p-0 position-absolute"
                      style={{ top: 15, right: -10 }}
                      onClick={() => handleEditClick(tier)}
                    >
                      <FaEdit style={{ fontSize: "20px" }} />
                    </button>
                    <div className="tier-header text-center p-3">
                      <img
                        src={tier.image_url}
                        alt={tier.name}
                        className="tier-icon"
                      />
                      <h4 className="tier-points">
                        {tier.min_points.toLocaleString("vi-VN")}{" "}
                        <img src={coinIcon} alt="coin" style={{ width: 20 }} />
                      </h4>
                      <h5 className="tier-name mt-3">Hạng: {tier.name}</h5>
                      <p className="tier-discount">
                        Ưu đãi: {tier.discount_percent}
                      </p>
                      <p className="tier-description">{tier.description}</p>
                    </div>
                    <div className="tier-footer text-muted">
                      Tạo lúc: <br />
                      {dayjs(tier.created_at).format("HH:mm - DD/MM/YYYY")}
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="flip-card-back">
                    <form onSubmit={handleSubmit}>
                      <button
                        className="btn btn-link p-0 position-absolute"
                        style={{ top: 15, right: -10 }}
                        type="button"
                        onClick={() => setEditTier(null)}
                      >
                        <img src={cancel} alt="cancel" style={{ width: 20 }} />
                      </button>
                      <div className="tier-header text-center p-3 mt-5">
                        <img
                          src={tier.image_url}
                          alt={tier.name}
                          className="tier-icon"
                        />
                        <div className="mb-2">
                          <h5 className="tier-name mt-3">Hạng: {tier.name}</h5>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Điểm tối thiểu</label>
                          <input
                            type="number"
                            className="form-control"
                            name="min_points"
                            value={form.min_points}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Ưu đãi (%)</label>
                          <input
                            type="number"
                            className="form-control"
                            name="discount_percent"
                            value={form.discount_percent}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        {updateError && (
                          <div className="text-danger">{updateError}</div>
                        )}
                        <div className="mt-5">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={updateLoading}
                          >
                            {updateLoading ? "Đang lưu..." : "Lưu"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMembership;
