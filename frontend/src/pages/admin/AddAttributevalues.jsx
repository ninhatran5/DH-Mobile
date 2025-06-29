// src/pages/admin/AddValuePage.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAttributeValue } from "../../slices/attributeValueSlice";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/admin/Attributes.css";
import { toast } from "react-toastify";
function AddValuePage() {
  const { attribute_id, name } = useParams();
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, attributeValues } = useSelector((state) => state.attributeValue);

  // Lấy danh sách value hiện tại của attribute_id
  const currentValues = attributeValues && attributeValues[attribute_id]
    ? attributeValues[attribute_id].map(v => v.value.trim().toLowerCase())
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Value không được để trống!");
      return;
    }
    if (currentValues.includes(value.trim().toLowerCase())) {
      toast.error("Giá trị này đã tồn tại!");
      return;
    }

    try {
      await dispatch(addAttributeValue({
        attribute_id,
        name,
        value,
      })).unwrap();
      alert("Thêm Value thành công!");
      navigate("/admin/attribute");
    } catch (err) {
      setError(err || "Lỗi không xác định!");
    }
  };

  return (
    <div className="adminaddattributevalues-container">
      <h1 className="adminaddattributevalues-title">
        Thêm giá trị mới cho thuộc tính:{" "}
        <span className="adminaddattributevalues-highlight">{name}</span>
      </h1>

      {error && (
        <p className="adminaddattributevalues-error">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="adminaddattributevalues-form">
        <div className="adminaddattributevalues-row">
          <label className="adminaddattributevalues-label">Giá trị:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="adminaddattributevalues-input"
          />
        </div>

        <div className="adminaddattributevalues-buttons">
          <button
            type="submit"
            className="adminaddattributevalues-submit"
            disabled={loading}
          >
            {loading ? "Đang thêm..." : "Thêm Value"}
          </button>
          <button
            type="button"
            className="adminaddattributevalues-cancel"
            onClick={() => navigate("/admin/attribute")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddValuePage;
