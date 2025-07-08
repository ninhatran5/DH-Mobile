// AdminMembership.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminLoyaltyTiers, updateAdminLoyaltyTier } from '../../slices/adminMembership';
import '../../assets/admin/AdminMembership.css';
import coinIcon from '../../assets/images/icons8-coin.gif';

const AdminMembership = () => {
  const dispatch = useDispatch();
  const { loyaltyTiers, loading, error, updateLoading, updateError } = useSelector((state) => state.adminMembership);

  const [editTier, setEditTier] = useState(null);
  const [form, setForm] = useState({ name: '', image_url: '', min_points: '', discount_percent: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    dispatch(fetchAdminLoyaltyTiers());
  }, [dispatch]);

  const handleEditClick = (tier) => {
    setEditTier(tier);
    setForm({
      tier_id: tier.tier_id,
      name: tier.name || '',
      image_url: tier.image_url || '',
      min_points: tier.min_points?.toString() || '',
      discount_percent: tier.discount_percent?.toString().replace('%', '') || '',
    });
    setImageFile(null);
    setImagePreview(tier.image_url || '');
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setImageFile(file);
      setImagePreview(file ? URL.createObjectURL(file) : '');
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editTier) return;

    if (imageFile) {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('min_points', form.min_points);
      formData.append('discount_percent', form.discount_percent);
      formData.append('image', imageFile);
      await dispatch(updateAdminLoyaltyTier({ id: editTier.tier_id, data: formData, isFormData: true }));
    } else {
      await dispatch(updateAdminLoyaltyTier({ id: editTier.tier_id, data: form }));
    }

    setEditTier(null);
    dispatch(fetchAdminLoyaltyTiers());
  };

  if (loading) return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-danger text-center my-4">Lỗi: {error}</div>;

  return (
    <div className="admin-membership-tier-cards container">
      <div className="row">
        {loyaltyTiers.map((tier) => {
          const isEditing = editTier?.tier_id === tier.tier_id;
          return (
            <div className="col-md-3 mb-4" key={tier.tier_id}>
              <div className={`flip-card ${isEditing ? 'flipped' : ''}`}>
                <div className="flip-card-inner">
                  {/* FRONT */}
                  <div className="flip-card-front tier-card tier-${tier.slug} position-relative">
                    <button
                      className="btn btn-link p-0 position-absolute"
                      style={{ top: 10, right: 10 }}
                      onClick={() => handleEditClick(tier)}
                    >✎</button>
                    <div className="tier-header text-center p-3">
                      <img src={tier.image_url} alt={tier.name} className="tier-icon" />
                      <h4 className="tier-points">
                        {tier.min_points.toLocaleString('vi-VN')}{' '}
                        <img src={coinIcon} alt="coin" style={{ width: 20 }} />
                      </h4>
                      <h5 className="tier-name mt-3">Hạng: {tier.name}</h5>
                      <p className="tier-discount">Ưu đãi: {tier.discount_percent}%</p>
                      <p className="tier-description">{tier.description}</p>
                    </div>
                    <div className="tier-footer text-muted">
                      Tạo lúc: {new Date(tier.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="flip-card-back">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-2">
                        <label className="form-label">Tên hạng</label>
                        <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Ảnh đại diện</label>
                        <input className="form-control" type="file" accept="image/*" onChange={handleChange} />
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: 80, marginTop: 10 }} />}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Điểm tối thiểu</label>
                        <input type="number" className="form-control" name="min_points" value={form.min_points} onChange={handleChange} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Ưu đãi (%)</label>
                        <input type="number" className="form-control" name="discount_percent" value={form.discount_percent} onChange={handleChange} required />
                      </div>
                      {updateError && <div className="text-danger">{updateError}</div>}
                      <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary" onClick={() => setEditTier(null)}>Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={updateLoading}>
                          {updateLoading ? 'Đang lưu...' : 'Lưu'}
                        </button>
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