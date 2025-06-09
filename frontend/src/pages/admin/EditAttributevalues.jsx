import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateAttributeValue } from "../../slices/attributeValueSlice";
import "../../assets/admin/Attributes.css";

function EditAttributeValue() {
  const { value_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { attributeValues, loading } = useSelector((state) => state.attributeValue);
  const [valueData, setValueData] = useState({});

  useEffect(() => {
    console.log(" attributeValues:", attributeValues);
    console.log(" value_id param:", value_id);

    let currentValue = null;
    Object.values(attributeValues).forEach(arr => {
      if (Array.isArray(arr)) {
        const found = arr.find(v => v.value_id === parseInt(value_id));
        if (found) {
          currentValue = found;
        }
      }
    });

    console.log("✅ currentValue tìm thấy:", currentValue);
    if (currentValue) {
      setValueData(currentValue);
    }
  }, [attributeValues, value_id]);

  const handleInputChange = (e) => {
    setValueData({
      ...valueData,
      value: e.target.value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!valueData.value || !valueData.value.trim()) {
    alert("Vui lòng nhập Value.");
    return;
  }

  console.log("🚀 Dữ liệu gửi lên server:", {
    id: valueData.value_id,
    updatedData: {
      value: valueData.value,
      attribute_id: valueData.attribute_id, // thêm
    },
  });

  dispatch(updateAttributeValue({
    id: valueData.value_id,
    updatedData: {
      value: valueData.value,
      attribute_id: valueData.attribute_id, // thêm
    },
  }))
    .unwrap()
    .then(() => {
      alert("Cập nhật thành công!");
      navigate("/admin/attribute");
    })
    .catch((err) => {
      alert("Lỗi khi cập nhật: " + err);
    });
};

  return (
    <div className="adminattributes">
      <h2>Chỉnh sửa giá trị thuộc tính</h2>
      <form onSubmit={handleSubmit} className="edit-value-form">
        <div className="form-group">
          <label>Thuộc tính:</label>
          <input
            type="text"
            value={valueData.value || ""}
            onChange={handleInputChange}
            className="input"
          />
        </div>
        <button type="submit" className="btn-edit">Lưu thay đổi</button>
      </form>
    </div>
  );
}

export default EditAttributeValue;
