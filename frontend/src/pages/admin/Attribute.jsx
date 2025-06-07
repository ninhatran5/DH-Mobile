import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttributes, deleteAttribute } from "../../slices/Attribute";
import { fetchAttributeValues,deleteAttributeValue } from "../../slices/attributeValueSlice";
import { Link } from "react-router-dom";
import "../../assets/admin/Attributes.css";

function AttributePage() {
  const dispatch = useDispatch();
  const { attributes, loading, error } = useSelector((state) => state.attribute);
  const { attributeValues } = useSelector((state) => state.attributeValue);

  const [newValues, setNewValues] = useState({});

  useEffect(() => {
    dispatch(fetchAttributes());
  }, [dispatch]);

  useEffect(() => {
    attributes.forEach((attr) => {
      dispatch(fetchAttributeValues(attr.attribute_id));
    });
  }, [attributes, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá Attribute này?")) {
      dispatch(deleteAttribute(id));
    }
  };

  const handleDeleteValue = (valueId) => {
  if (window.confirm("Bạn có chắc chắn muốn xoá Value này?")) {
    dispatch(deleteAttributeValue(valueId));
  }
};


  const handleEditValue = (valueId) => {
    alert("Chức năng sửa Value id: " + valueId);
  };

  const handleInputChange = (attrId, e) => {
    setNewValues({
      ...newValues,
      [attrId]: e.target.value,
    });
  };

  const handleAddValue = (attrId) => {
    const value = newValues[attrId]?.trim();
    if (!value) {
      alert("Vui lòng nhập giá trị Value.");
      return;
    }
    console.log(`Thêm Value "${value}" cho attribute id:`, attrId);

    setNewValues({ ...newValues, [attrId]: "" });
  };

  return (
    <div className="adminattributes">
      <h1>Danh sách thuộc tính </h1>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Đang tải...</p>}

      <div className="header-actions">
        <Link to="/admin/Addattribute">
          <button className="btn-add">+ Thêm mới tên thuộc tính</button>
        </Link>
      </div>

      <ul className="attribute-list">
        {attributes.map((attr) => {
          const values = attributeValues[attr.attribute_id] || [];
          return (
            <li key={attr.attribute_id} className="attribute-item">
              <div className="attribute-row">
                <span className="attribute-label">Tên thuộc tính:</span>
                <span className="attribute-data">{attr.name}</span>
              </div>
              {values.length > 0 && (
                <div className="attribute-row">
                  <span className="attribute-label">Giá trị:</span>
                  <span className="attribute-data">
                    {values.map((value) => (
                      <div key={value.value_id} className="value-item">
                        <button
                          className="btn-delete-value"
                          title="Xoá Value"
                          onClick={() => handleDeleteValue(value.value_id)}
                        >
                          ×
                        </button>

                       <Link to={`/admin/EditAttributevalues/${value.value_id}`}>
  <button
    className="btn-edit-value"
    title="Sửa Value"
  >
    ✎
  </button>
</Link>


                        <span className="value-text">{value.value}</span>
                      </div>
                    ))}
                  </span>
                </div>
              )}

             

             <div className="action-buttons">
  <Link to={`/admin/Editattribute/${attr.attribute_id}`}>
    <button className="btn-edit">Sửa</button>
  </Link>
  <button
    className="btn-delete"
    onClick={() => handleDelete(attr.attribute_id)}
  >
    Xoá
  </button>
  <Link to={`/admin/AddAttributevalues/${attr.attribute_id}`}>
    <button className="btn-add-value ml">+ Thêm thuộc tính</button>
  </Link>
</div>

            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AttributePage;
