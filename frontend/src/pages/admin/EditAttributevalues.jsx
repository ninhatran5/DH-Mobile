import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateAttributeValue } from "../../slices/attributeValueSlice";
import "../../assets/admin/Attributes.css";

function EditAttributeValue() {
  const { value_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { attributeValues } = useSelector((state) => state.attributeValue);
  const [valueData, setValueData] = useState({});

  useEffect(() => {

    let currentValue = null;
    Object.values(attributeValues).forEach(arr => {
      if (Array.isArray(arr)) {
        const found = arr.find(v => v.value_id === parseInt(value_id));
        if (found) {
          currentValue = found;
        }
      }
    });

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
 
  dispatch(updateAttributeValue({
    id: valueData.value_id,
    updatedData: {
      value: valueData.value,
      attribute_id: valueData.attribute_id,
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
    <div className="adminEditAttribute">
      <h1>Chỉnh sửa giá trị thuộc tính</h1>
      <form onSubmit={handleSubmit} className="form-edit-attribute">
        <label htmlFor="value">Giá trị thuộc tính:</label>
        <input
          id="value"
          type="text"
          value={valueData.value || ""}
          onChange={handleInputChange}
          placeholder="Nhập giá trị thuộc tính"
        />
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn-edit-attribute">Lưu thay đổi</button>
          <button
            type="button"
            className="btn-cancel-attribute"
            onClick={() => navigate("/admin/attribute")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAttributeValue;
