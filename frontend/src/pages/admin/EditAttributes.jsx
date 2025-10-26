import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAttributes, updateAttribute } from "../../slices/Attribute";
import "../../assets/admin/EditAttribute.css";
import { toast } from "react-toastify";
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
    const attribute = attributes.find((a) => String(a.attribute_id) === String(id));
    if (attribute) {
      setAttrName(attribute.name);
    }
  }, [attributes, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!attrName.trim()) {
      toast.error("Tên thuộc tính không được để trống");
      return;
    }

    dispatch(updateAttribute({ id, updatedData: { name: attrName } }))
      .unwrap()
      .then(() => {
        toast.success("Cập nhật tên thuộc tính thành công");
        navigate("/admin/attribute");
      })
      .catch((err) => {
        toast.error("Lỗi cập nhật: " + err);
      });
  };

  return (
    <div className="adminEditAttribute">
      <h1>Cập nhật tên thuộc tính</h1>
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
          <button type="submit" className="btn-edit-attribute">
            Cập nhật
          </button>
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

export default EditAttribute;
