import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttributes, deleteAttribute } from "../../slices/Attribute";
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { Link } from "react-router-dom";
import "../../assets/admin/Attributes.css";

function AttributePage() {
  const dispatch = useDispatch();
  const { attributes, loading, error } = useSelector((state) => state.attribute);
  const { attributeValues } = useSelector((state) => state.attributeValue);

  useEffect(() => {
    dispatch(fetchAttributes());
  }, [dispatch]);

  useEffect(() => {
    attributes.forEach((attr) => {
      dispatch(fetchAttributeValues(attr.attribute_id));
    });
  }, [attributes, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá?")) {
      dispatch(deleteAttribute(id));
    }
  };

  return (
    <div className="adminattributes">
      <h1>Danh sách Attributes</h1>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Đang tải...</p>}

      <div className="header-actions">
        <Link to="/admin/Addattribute">
          <button className="btn-add">+ Thêm mới Attribute</button>
        </Link>
      </div>

      <ul className="attribute-list">
        {attributes.map((attr) => (
          <li key={attr.attribute_id} className="attribute-item">
            <span>{attr.name}</span>
            <div className="action-buttons">
              <Link to={`/admin/Editattribute/${attr.attribute_id}`}>
                <button className="btn-edit">Sửa</button>
              </Link>
              <button className="btn-delete" onClick={() => handleDelete(attr.attribute_id)}>
                Xoá
              </button>
            </div>

            {/* Hiển thị danh sách AttributeValue */}
            <ul className="attributevalue-list">
              {(attributeValues[attr.attribute_id] || []).map((value) => (
                <li key={value.attribute_value_id} className="attributevalue-item">
                  {value.value}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AttributePage;
