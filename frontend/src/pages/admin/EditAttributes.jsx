import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAttributes, updateAttribute } from "../../slices/Attribute";

function EditAttribute() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { attributes, loading, error } = useSelector((state) => state.attribute);
  const [attrName, setAttrName] = useState("");

  useEffect(() => {
    if (attributes.length === 0) {
      dispatch(fetchAttributes());
    }
  }, [attributes.length, dispatch]);

  useEffect(() => {
    const attribute = attributes.find((a) => a.attribute_id === id);
    if (attribute) {
      setAttrName(attribute.name);
    }
  }, [attributes, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!attrName.trim()) {
      alert("Tên attribute không được để trống");
      return;
    }

    dispatch(updateAttribute({ id, updatedData: { name: attrName } }))
      .unwrap()
      .then(() => {
        alert("Cập nhật attribute thành công");
        navigate("/admin/attribute");
      })
      .catch((err) => {
        alert("Lỗi cập nhật: " + err);
      });
  };

  return (
    <div className="adminattributes">
      <h1>Cập nhật thuộc tính </h1>
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Đang tải...</p>}

      <form onSubmit={handleSubmit} className="form-edit-attribute">
        <label htmlFor="name">Tên thuộc tính:</label>
        <input
          id="name"
          type="text"
          value={attrName}
          onChange={(e) => setAttrName(e.target.value)}
          placeholder="Nhập tên attribute"
        />
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" className="btn-edit">
           Cập nhật 
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAttribute;
