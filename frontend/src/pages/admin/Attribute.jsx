import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttributes, deleteAttribute } from "../../slices/Attribute";
import { fetchAttributeValues, deleteAttributeValue } from "../../slices/attributeValueSlice";
import { Link } from "react-router-dom";
import "../../assets/admin/Attributes.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

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

  const handleDelete = async (id) => {
    const values = attributeValues[id] || [];
    if (values.length > 0) {
      toast.error("Không thể xoá thuộc tính này vì vẫn còn giá trị bên trong.");
      return;
    }
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá thuộc tính này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true

    });
    if (result.isConfirmed) {
      dispatch(deleteAttribute(id));
      Swal.fire({
        icon: "success",
        title: "Đã xoá thành công!",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleDeleteValue = async (valueId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá Value này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true
    });
    if (result.isConfirmed) {
      dispatch(deleteAttributeValue(valueId));
      Swal.fire({
        icon: "success",
        title: "Đã xoá Value thành công!",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div className="adminattributes">
      <ToastContainer />
      <h1>Danh sách thuộc tính </h1>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Đang tải...</p>}

      <div className="header-actions" style={{ textAlign: "right", marginBottom: "1rem" }}>
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
                          &#x2715;
                        </button>

                        <Link to={`/admin/EditAttributevalues/${value.value_id}`}>
                          <button
                            className="btn-edit-value"
                            title="Sửa Value"
                            type="button"
                          >
                            &#9998;
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
                
                  <button className="btn-edit"
                  style={{
              padding: "8px 16px",
              border: "1px solid #eab308",
              borderRadius: "6px",
              backgroundColor: "#fef9c3",
              color: "#854d0e",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none"
            }}>
                     <i className="bi bi-pencil"></i>
                    Cập nhật thuộc tính
                    </button>
                </Link>
                <button
                  className="btn-delete-attibute"
                  onClick={() => handleDelete(attr.attribute_id)}
                  style={{
              padding: "5px 10px",
              border: "1px solid #dc2626",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
                >
                   <i className="bi bi-trash"></i> 
                  Xoá thuộc tính
                </button>
                <Link to={`/admin/AddAttributevalues/${attr.attribute_id}`}>
                  <button className="btn-add-value ml" 
                  >
                    
                    + Thêm giá trị thuộc tính</button>
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
