// src/pages/admin/AddValuePage.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAttributeValue } from "../../slices/attributeValueSlice";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/admin/Attributes.css";

function AddValuePage() {
  const { attribute_id } = useParams();
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.attributeValue);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Value không được để trống!");
      return;
    }

    try {
      await dispatch(addAttributeValue({
        attribute_id,
        value,
      })).unwrap();
      alert("Thêm Value thành công!");
      navigate("/admin/attribute");
    } catch (err) {
      setError(err || "Lỗi không xác định!");
    }
  };

  return (
    <div className="adminattributes">
      <h1>Thêm Value mới cho Attribute ID: {attribute_id}</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="attribute-row">
          <label className="attribute-label">Value:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="attribute-data"
            style={{ flex: "1", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div className="action-buttons" style={{ marginTop: "16px" }}>
          <button type="submit" className="btn-add" disabled={loading}>
            {loading ? "Đang thêm..." : "Thêm Value"}
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={() => navigate("/admin/attributes")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddValuePage;
