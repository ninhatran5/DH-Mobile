import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminLoyaltyTiers } from '../../slices/adminMembership';
import '../../assets/admin/AdminMembership.css';

const AdminMembership = () => {
  const dispatch = useDispatch();
  const { loyaltyTiers, loading, error } = useSelector((state) => state.adminMembership);

  useEffect(() => {
    dispatch(fetchAdminLoyaltyTiers());
  }, [dispatch]);

  if (loading) return <div className="text-center my-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-danger text-center my-4">Lỗi: {error}</div>;

  return (
    <div className="admin-membership-tier-cards container">
      <div className="row">
        {loyaltyTiers.map((tier) => (
          <div className="col-md-3 mb-4" key={tier.tier_id}>
            <div className={`tier-card tier-${tier.slug}`}>
              <div className="tier-header">
                <img src={tier.image_url} alt={tier.name} className="tier-icon" />
                <h4 className="tier-points">{tier.min_points.toLocaleString('vi-VN')} điểm</h4>
                <h5 className="tier-name">{tier.name}</h5>
                <p className="tier-discount">Ưu đãi: {tier.discount_percent}</p>
                <p className="tier-description">{tier.description}</p>
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
