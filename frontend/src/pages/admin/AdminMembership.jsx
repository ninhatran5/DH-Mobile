import React, { useEffect, useState } from 'react';
import coinIcon from '../../assets/images/icons8-coin.gif';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminLoyaltyTiers, updateAdminLoyaltyTier } from '../../slices/adminMembership';
import '../../assets/admin/AdminMembership.css';
import Loading from '../../components/Loading';

const AdminMembership = () => {
  const dispatch = useDispatch();
  const { loyaltyTiers, loading, error, updateLoading, updateError } = useSelector((state) => state.adminMembership);

  const [showEdit, setShowEdit] = useState(false);
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
      tier_id: tier.tier_id || '',
      name: tier.name || '',
      image_url: tier.image_url || '',
      min_points: tier.min_points !== undefined && tier.min_points !== null ? String(tier.min_points) : '',
      discount_percent:
        tier.discount_percent !== undefined && tier.discount_percent !== null
          ? String(tier.discount_percent).replace('%', '').trim()
          : '',
    });
    setImageFile(null);
    setImagePreview(tier.image_url || '');
    setShowEdit(true);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setImageFile(file);
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview('');
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editTier) return;

    

    await dispatch(
      updateAdminLoyaltyTier({
        id: editTier.tier_id || editTier.id,
        data: {
          name: form.name,
          image_url: imageFile ? imagePreview : form.image_url, 
          min_points: form.min_points,
          discount_percent: form.discount_percent,
        },
      })
    );
    setShowEdit(false);
  };

  if (loading) return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-danger text-center my-4">Lỗi: {error}</div>;

  return (
    <div className="admin-membership-tier-cards container">
      {updateLoading && <Loading />}
      {showEdit && (
        <div className="admin-membership-modal-backdrop">
          <div className="admin-membership-modal-dialog">
            <form className="admin-membership-modal-content" onSubmit={handleSubmit}>
              <div className="admin-membership-modal-header">
                <h5 className="admin-membership-modal-title">Chỉnh sửa hạng thành viên</h5>
                <button type="button" className="btn-close" onClick={() => setShowEdit(false)}></button>
              </div>
              <div className="admin-membership-modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên hạng</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ảnh đại diện</label>
                  <input
                    className="form-control"
                    name="image_url"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: 10 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: 120, maxHeight: 120, border: '1px solid #eee', borderRadius: 8 }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Điểm tối thiểu</label>
                  <input className="form-control" name="min_points" value={form.min_points} onChange={handleChange} required type="number" min="0" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ưu đãi (%)</label>
                  <input
                    className="form-control"
                    name="discount_percent"
                    value={form.discount_percent}
                    onChange={handleChange}
                    required
                    type="number"
                    min="0"
                  />
                </div>
                {updateError && <div className="text-danger">{updateError}</div>}
              </div>
              <div className="admin-membership-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={updateLoading}>
                  {updateLoading ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        {loyaltyTiers.map((tier) => (
          <div className="col-md-3 mb-4" key={tier.tier_id}>
            <div className={`tier-card tier-${tier.slug} position-relative`}>
              <button
                className="btn btn-link p-0 position-absolute"
                style={{ top: 20, right: -10, zIndex: 10 }}
                title="Chỉnh sửa hạng này"
                onClick={() => handleEditClick(tier)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50">
                  <path d="M 25 5 C 14.351563 5 5.632813 13.378906 5.054688 23.890625 C 5.007813 24.609375 5.347656 25.296875 5.949219 25.695313 C 6.550781 26.089844 7.320313 26.132813 7.960938 25.804688 C 8.601563 25.476563 9.019531 24.828125 9.046875 24.109375 C 9.511719 15.675781 16.441406 9 25 9 C 29.585938 9 33.699219 10.925781 36.609375 14 L 34 14 C 33.277344 13.988281 32.609375 14.367188 32.246094 14.992188 C 31.878906 15.613281 31.878906 16.386719 32.246094 17.007813 C 32.609375 17.632813 33.277344 18.011719 34 18 L 40.261719 18 C 40.488281 18.039063 40.71875 18.039063 40.949219 18 L 44 18 L 44 8 C 44.007813 7.460938 43.796875 6.941406 43.414063 6.558594 C 43.03125 6.175781 42.511719 5.964844 41.96875 5.972656 C 40.867188 5.988281 39.984375 6.894531 40 8 L 40 11.777344 C 36.332031 7.621094 30.964844 5 25 5 Z M 43.03125 23.972656 C 41.925781 23.925781 40.996094 24.785156 40.953125 25.890625 C 40.488281 34.324219 33.558594 41 25 41 C 20.414063 41 16.304688 39.074219 13.390625 36 L 16 36 C 16.722656 36.011719 17.390625 35.632813 17.753906 35.007813 C 18.121094 34.386719 18.121094 33.613281 17.753906 32.992188 C 17.390625 32.367188 16.722656 31.988281 16 32 L 9.71875 32 C 9.507813 31.96875 9.296875 31.96875 9.085938 32 L 6 32 L 6 42 C 5.988281 42.722656 6.367188 43.390625 6.992188 43.753906 C 7.613281 44.121094 8.386719 44.121094 9.007813 43.753906 C 9.632813 43.390625 10.011719 42.722656 10 42 L 10 38.222656 C 13.667969 42.378906 19.035156 45 25 45 C 35.648438 45 44.367188 36.621094 44.945313 26.109375 C 44.984375 25.570313 44.800781 25.039063 44.441406 24.636719 C 44.078125 24.234375 43.570313 23.996094 43.03125 23.972656 Z"></path>
                </svg>
              </button>
              <div className="tier-header">
                <img src={tier.image_url} alt={tier.name} className="tier-icon" />
                <h4 className="tier-points">
                  {tier.min_points.toLocaleString('vi-VN')}
                  <span style={{ marginLeft: 6, verticalAlign: 'middle' }}>
                    <img src={coinIcon} alt="coin" style={{ width: 25, height: 25, objectFit: 'contain', marginBottom: 6 }} />
                  </span>
                </h4>
                <h5 className="tier-name mt-4">Hạng: {tier.name}</h5>
                <p className="tier-discount mt-4">
                  Ưu đãi: {tier.discount_percent !== undefined && tier.discount_percent !== null
                    ? `${String(tier.discount_percent).replace('%', '').trim()}%`
                    : '0%'}
                </p>
                <p className="tier-description mt-4">{tier.description}</p>
              </div>
              {Array.isArray(tier.benefits) && tier.benefits.length > 0 && (
                <ul className="tier-benefits">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              )}
              <div className="tier-footer text-muted">
                Tạo lúc: {new Date(tier.created_at).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminMembership;

